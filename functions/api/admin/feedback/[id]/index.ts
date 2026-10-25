import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../../_auth.ts';
import type { FeedbackAuditLog, FeedbackSubmission } from '../../../../src/types/feedback';

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params?: { id?: string };
}): Promise<Response> {
  const { request, env, params } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  // Extract ID from params or URL pathname
  let submissionId = (params?.id || '').trim();
  if (!submissionId) {
    const segments = new URL(request.url).pathname.split('/').filter(Boolean);
    submissionId = (segments[segments.length - 1] || '').trim();
  }

  if (!submissionId) {
    return jsonResponse({ error: 'missing_id', message: 'Submission ID is required.' }, 400);
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('test.supabase.co')) {
    // Offline or test mock response
    return jsonResponse({
      success: true,
      submission: {
        id: submissionId,
        submission_type: 'comment',
        status: 'New',
        user_message: 'Mock offline submission',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        audit_logs: [],
      },
    });
  }

  try {
    // 1. Fetch submission record
    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/feedback_submissions?id=eq.${encodeURIComponent(submissionId)}&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!subRes.ok) {
      console.error('Failed to query feedback submission by id', await subRes.text());
      return jsonResponse({ error: 'database_error', message: 'Failed to retrieve feedback submission.' }, 500);
    }

    const subRows = (await subRes.json()) as FeedbackSubmission[];
    if (!subRows || subRows.length === 0) {
      return jsonResponse({ error: 'not_found', message: 'Feedback submission not found.' }, 404);
    }

    const submission = subRows[0];

    // 2. Fetch associated audit logs
    const auditRes = await fetch(
      `${supabaseUrl}/rest/v1/feedback_audit_logs?submission_id=eq.${encodeURIComponent(submissionId)}&order=action_timestamp.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    let auditLogs: FeedbackAuditLog[] = [];
    if (auditRes.ok) {
      auditLogs = (await auditRes.json()) as FeedbackAuditLog[];
    }

    return jsonResponse({
      success: true,
      submission: {
        ...submission,
        audit_logs: auditLogs,
      },
    });
  } catch (err) {
    console.error('Feedback detail network failure', err);
    return jsonResponse({ error: 'network_error', message: 'Service temporarily unavailable.' }, 503);
  }
}
