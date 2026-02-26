
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Components (Refactored to separate files)
import { Overview } from './console/Overview';
import { Credentials } from './console/Credentials';
import { RequestLogs } from './console/RequestLogs';
import { OrgAuditLogs } from './console/OrgAuditLogs';

// Other Pages
import { Billing } from './Billing';
import { Team } from './Team';
import { Webhooks } from './Webhooks';
import { Integration } from './Integration';
import { OrgSettings } from './Settings';
import { Usage } from './Usage'; 
import { OAuth } from './OAuth';

import { FEATURE_FLAGS } from '../constants';

export const Console: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
      return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/credentials" element={<Credentials />} />
        {FEATURE_FLAGS.OAUTH_APPS && <Route path="/oauth" element={<OAuth />} />}
        <Route path="/usage" element={<Usage />} />
        {FEATURE_FLAGS.LOGS_PAGE && <Route path="/logs" element={<RequestLogs />} />}
        
        {FEATURE_FLAGS.AUDIT_LOGS && <Route path="/audit" element={<OrgAuditLogs />} />}
        {FEATURE_FLAGS.BILLING_PAGE && <Route path="/billing" element={<Billing />} />}
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<OrgSettings />} />
        {FEATURE_FLAGS.WEBHOOKS_PAGE && <Route path="/webhooks" element={<Webhooks />} />}
        {FEATURE_FLAGS.INTEGRATION_PAGE && <Route path="/integration" element={<Integration />} />}
        
        <Route path="*" element={<Navigate to="/console" replace />} />
    </Routes>
  );
};
