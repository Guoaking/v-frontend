
import { DocSection, ApiEndpoint, ApiField, ApiResponseDef } from '../types';

// Swagger 2.0 (OpenAPI 2.0) Types
interface SwaggerSpec {
  swagger: string;
  info: any;
  paths: Record<string, Record<string, SwaggerOperation>>;
  definitions?: Record<string, SwaggerSchema>;
}

interface SwaggerOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  consumes?: string[];
  produces?: string[];
  parameters?: SwaggerParameter[];
  responses?: Record<string, SwaggerResponse>;
}

interface SwaggerParameter {
  name: string;
  in: 'body' | 'formData' | 'query' | 'path' | 'header';
  description?: string;
  required?: boolean;
  type?: string;
  schema?: SwaggerSchema; // For in: body
  enum?: string[];
  items?: SwaggerSchema; // For array types in formData
  default?: any;
}

interface SwaggerResponse {
  description: string;
  schema?: SwaggerSchema;
}

interface SwaggerSchema {
  type?: string;
  required?: string[];
  properties?: Record<string, SwaggerSchema>;
  items?: SwaggerSchema;
  $ref?: string;
  allOf?: SwaggerSchema[]; // Composition
  enum?: (string | number)[];
  description?: string;
  format?: string;
  example?: any;
  // Custom Extensions for Error Codes
  'x-enum-varnames'?: string[];
  'x-enum-descriptions'?: string[];
  'x-enum-comments'?: Record<string, string>;
}

// Configuration: Order of sections in the sidebar
const SECTION_ORDER = [
  'Auth',
  'OCR',
  'Face Recognition',
  'Liveness Detection',
  'General',
  'Reference' // Error Codes usually go here
];

// Helper: Resolve $ref (e.g., "#/definitions/api.ErrorResponse")
const resolveDefinition = (ref: string | undefined, spec: SwaggerSpec): SwaggerSchema | undefined => {
  if (!ref) return undefined;
  const key = ref.replace('#/definitions/', '');
  return spec.definitions?.[key];
};

// Helper: Merge schemas for allOf
const mergeSchemas = (schemas: SwaggerSchema[], spec: SwaggerSpec): SwaggerSchema => {
  let merged: SwaggerSchema = { type: 'object', properties: {}, required: [] };
  
  schemas.forEach(s => {
    const resolved = s.$ref ? resolveDefinition(s.$ref, spec) : s;
    if (!resolved) return;

    if (resolved.properties) {
      merged.properties = { ...merged.properties, ...resolved.properties };
    }
    if (resolved.required) {
      merged.required = [...(merged.required || []), ...resolved.required];
    }
    if (resolved.type) {
        merged.type = resolved.type;
    }
  });

  return merged;
};

// Helper: Convert Swagger Schema to Internal ApiField[]
const schemaToApiFields = (
  schema: SwaggerSchema, 
  spec: SwaggerSpec,
  parentName: string = 'root'
): ApiField[] => {
  let target = schema;

  // 1. Resolve Ref
  if (target.$ref) {
    const resolved = resolveDefinition(target.$ref, spec);
    if (resolved) target = resolved;
  }

  // 2. Handle allOf (Composition)
  if (target.allOf) {
    target = mergeSchemas(target.allOf, spec);
  }

  // 3. Handle Object Properties
  if (target.properties) {
    return Object.entries(target.properties).map(([key, propSchema]) => {
      const isRequired = target.required?.includes(key) || false;
      return schemaToSingleApiField(key, propSchema, spec, isRequired);
    });
  }

  return [];
};

// Helper: Convert a single property to ApiField
const schemaToSingleApiField = (
  name: string, 
  schema: SwaggerSchema, 
  spec: SwaggerSpec,
  isRequired: boolean
): ApiField => {
  let target = schema;
  if (target.$ref) {
    const resolved = resolveDefinition(target.$ref, spec);
    if (resolved) target = resolved;
  }
  
  // Handle allOf in property
  if (target.allOf) {
      target = mergeSchemas(target.allOf, spec);
  }

  let type = target.type || 'object';
  let children: ApiField[] | undefined = undefined;

  // Map simple types
  if (type === 'integer' || type === 'number') type = 'number';
  if (type === 'boolean') type = 'boolean';
  if (target.format === 'binary') type = 'file'; // Swagger 2.0 file in body/schema

  // Handle Array
  if (type === 'array' && target.items) {
    let itemsTarget = target.items;
    if (itemsTarget.$ref) {
         const resolvedItem = resolveDefinition(itemsTarget.$ref, spec);
         if (resolvedItem) itemsTarget = resolvedItem;
    }
    
    // Check if array of objects
    if (itemsTarget.type === 'object' || itemsTarget.properties) {
        type = 'object[]';
        if (itemsTarget.properties) {
            children = schemaToApiFields(itemsTarget, spec);
        }
    } else {
        type = `${itemsTarget.type || 'string'}[]`;
    }
  }

  // Handle Nested Object
  if (type === 'object' && target.properties) {
    children = schemaToApiFields(target, spec);
  }

  return {
    name,
    type,
    required: isRequired,
    description: target.description || '',
    enum: target.enum ? target.enum.map(String) : undefined,
    children
  };
};

/**
 * Adapter to convert Swagger 2.0 JSON to Application DocSection[]
 */
export const convertSwaggerToDocs = (json: any): DocSection[] => {
  const spec = json as SwaggerSpec;
  const sections: Record<string, DocSection> = {};

  // Sort paths for consistency
  const sortedPaths = Object.entries(spec.paths || {}).sort((a, b) => a[0].localeCompare(b[0]));

  sortedPaths.forEach(([path, methods]) => {
    // --- EXCLUSION LOGIC ---
    // Skip specific endpoints that we want to document manually or hide
    if (path === '/docs/error-codes') return; 

    Object.entries(methods).forEach(([method, op]) => {
      if (!op) return;

      // --- SMART GROUPING LOGIC ---
      let groupName = 'General';
      
      // 1. Try to use Tags (excluding "Public")
      if (op.tags && op.tags.length > 0) {
        const functionalTags = op.tags.filter(t => t !== 'Public');
        if (functionalTags.length > 0) {
            groupName = functionalTags[0];
        }
      }

      // 2. If still General (or default), try to infer from Path
      if (groupName === 'General') {
          if (path.includes('/face/')) groupName = 'Face Recognition';
          else if (path.includes('/liveness/')) groupName = 'Liveness Detection';
          else if (path.includes('/ocr')) groupName = 'OCR';
          else if (path.includes('/auth/')) groupName = 'Authentication';
          else if (path.includes('/docs/')) groupName = 'Reference';
      }

      // Initialize Section if missing
      if (!sections[groupName]) {
        sections[groupName] = {
          id: groupName.toLowerCase().replace(/\s+/g, '_'),
          title: groupName,
          content: '',
          subsections: []
        };
      }

      // --- Request Body / Parameters Parsing ---
      const requestBody: ApiField[] = [];
      
      if (op.parameters) {
        op.parameters.forEach(param => {
          if (param.in === 'formData') {
             requestBody.push({
               name: param.name,
               type: param.type === 'file' ? 'file' : param.type || 'string',
               description: param.description || '',
               required: param.required,
               enum: param.enum ? param.enum.map(String) : undefined
             });
          } 
          else if (param.in === 'body' && param.schema) {
             const fields = schemaToApiFields(param.schema, spec);
             requestBody.push(...fields);
          }
          else if (param.in === 'query') {
              requestBody.push({
                  name: param.name + ' (query)',
                  type: param.type || 'string',
                  description: param.description || '',
                  required: param.required,
                  enum: param.enum ? param.enum.map(String) : undefined
              });
          }
        });
      }

      // --- Response Parsing ---
      const responses: ApiResponseDef[] = [];
      if (op.responses) {
        Object.entries(op.responses).forEach(([codeStr, resp]) => {
           let schemaFields: ApiField[] = [];
           let exampleStr = '{}';

           if (resp.schema) {
              schemaFields = schemaToApiFields(resp.schema, spec);
              
              const generateExample = (fields: ApiField[]): any => {
                  const obj: any = {};
                  fields.forEach(f => {
                      if (f.type === 'integer' || f.type === 'number') obj[f.name] = 0;
                      else if (f.type === 'boolean') obj[f.name] = true;
                      else if (f.type === 'array' || f.type.endsWith('[]')) obj[f.name] = [];
                      else if (f.type === 'object' && f.children) obj[f.name] = generateExample(f.children);
                      else if (f.name.includes('id')) obj[f.name] = "12345";
                      else obj[f.name] = "string";
                  });
                  return obj;
              };
              
              if ((codeStr === '200' || codeStr === '201') && schemaFields.length > 0) {
                 exampleStr = JSON.stringify(generateExample(schemaFields), null, 2);
              }
           }

           responses.push({
             code: parseInt(codeStr),
             description: resp.description,
             schema: schemaFields,
             example: exampleStr
           });
        });
      }

      const endpoint: ApiEndpoint = {
        method: method.toUpperCase() as any,
        path: path,
        description: op.summary || op.description || '',
        requestBody: requestBody,
        responses: responses,
        playgroundLink: 
            path.includes('/ocr') ? 'cat=ocr' : 
            path.includes('/face') ? 'cat=face' : 
            path.includes('/liveness') ? 'cat=liveness' : undefined
      };

      sections[groupName].subsections?.push({
        id: (op.operationId || `${method}_${path}`).replace(/\W+/g, '_'),
        title: op.summary || path,
        content: op.description,
        api: endpoint
      });
    });
  });

  // --- 5. Error Codes Table Generation ---
  // Create a dedicated "Reference" section if it doesn't exist or append to it
  if (spec.definitions && spec.definitions['api.ResponseCode']) {
      const def = spec.definitions['api.ResponseCode'];
      if (def.enum && def['x-enum-varnames']) {
          const rows = def.enum.map((code, idx) => {
              const varname = def['x-enum-varnames']?.[idx] || '';
              const desc = def['x-enum-descriptions']?.[idx] || '';
              const comment = (def['x-enum-comments'] && def['x-enum-comments'][varname]) || '';
              return [String(code), varname, desc, comment];
          });

          const errorSection: DocSection = {
              id: 'error_codes',
              title: 'Global Error Codes',
              content: 'Standard response codes used across the API to indicate success or failure reasons.',
              tableData: {
                  headers: ['Code', 'Constant', 'Description', 'Details'],
                  rows: rows
              }
          };

          if (!sections['Reference']) {
              sections['Reference'] = {
                  id: 'reference',
                  title: 'Reference',
                  content: 'Technical references and enumerations.',
                  subsections: []
              };
          }
          // Prepend or Append? Let's prepend to Reference subsections so it's prominent
          sections['Reference'].subsections = [errorSection, ...(sections['Reference'].subsections || [])];
      }
  }

  // --- SORTING SECTIONS ---
  const sortedSections = Object.values(sections).sort((a, b) => {
      const indexA = SECTION_ORDER.indexOf(a.title);
      const indexB = SECTION_ORDER.indexOf(b.title);
      
      // If both are in the known order list, sort by index
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      
      // If only A is in list, A comes first
      if (indexA !== -1) return -1;
      
      // If only B is in list, B comes first
      if (indexB !== -1) return 1;
      
      // Otherwise alphabetical
      return a.title.localeCompare(b.title);
  });

  return sortedSections;
};
