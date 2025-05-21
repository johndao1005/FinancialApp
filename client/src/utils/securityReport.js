/**
 * Security Analysis Report
 * 
 * This utility evaluates the current application security posture
 * and identifies areas that may need improvement.
 * 
 * Usage:
 * Import this script in the developer console to run a security audit
 * in development environments only.
 */

(function() {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Security analysis should only be run in development environments');
    return;
  }
  
  console.log('%c Financial App Security Analysis ', 'background: #d32f2f; color: white; font-size: 14px; font-weight: bold; padding: 6px;');
  console.log('Running security checks...');
  
  const securityReport = {
    timestamp: new Date().toISOString(),
    issues: [],
    passedChecks: [],
    overallRisk: 'low', // Will be calculated
    recommendations: []
  };
  
  // Check for HTTPS
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    securityReport.issues.push({
      severity: 'high',
      description: 'Application not running on HTTPS',
      risk: 'Man-in-the-middle attacks, data theft',
      recommendation: 'Enable HTTPS for all environments including development'
    });
  } else {
    securityReport.passedChecks.push('HTTPS enabled');
  }
  
  // Check for secure cookies
  const cookies = document.cookie.split(';');
  const hasInsecureCookies = cookies.some(cookie => 
    !cookie.includes('Secure') && 
    !cookie.includes('HttpOnly') && 
    !cookie.includes('SameSite'));
  
  if (hasInsecureCookies) {
    securityReport.issues.push({
      severity: 'medium',
      description: 'Insecure cookie configuration detected',
      risk: 'Cookie theft, session hijacking',
      recommendation: 'Use Secure, HttpOnly, and SameSite attributes for cookies'
    });
  } else {
    securityReport.passedChecks.push('Secure cookie configuration');
  }
  
  // Check for Content Security Policy
  const hasCSP = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!hasCSP) {
    securityReport.issues.push({
      severity: 'medium',
      description: 'No Content Security Policy detected',
      risk: 'XSS attacks, data injection',
      recommendation: 'Implement a strict Content Security Policy'
    });
  } else {
    securityReport.passedChecks.push('Content Security Policy implemented');
  }
  
  // Check localStorage usage for sensitive data
  const localStorageKeys = Object.keys(localStorage);
  const sensitiveKeys = localStorageKeys.filter(key => 
    key.toLowerCase().includes('token') || 
    key.toLowerCase().includes('auth') || 
    key.toLowerCase().includes('password') ||
    key.toLowerCase().includes('key')
  );
  
  if (sensitiveKeys.length > 0) {
    securityReport.issues.push({
      severity: 'medium',
      description: 'Sensitive data potentially stored in localStorage',
      risk: 'Data theft, XSS vulnerabilities',
      recommendation: 'Use encrypted storage or secure HTTP-only cookies for sensitive data'
    });
  } else {
    securityReport.passedChecks.push('No obvious sensitive data in localStorage');
  }
  
  // Check for session timeout mechanisms
  const hasSessionTimeout = localStorageKeys.some(key => key.includes('expiry'));
  if (!hasSessionTimeout) {
    securityReport.issues.push({
      severity: 'low',
      description: 'No session timeout mechanism detected',
      risk: 'Extended unauthorized access if authentication is compromised',
      recommendation: 'Implement session timeout and automatic logout'
    });
  } else {
    securityReport.passedChecks.push('Session timeout mechanism implemented');
  }
  
  // Calculate overall risk
  const highSeverityCount = securityReport.issues.filter(issue => issue.severity === 'high').length;
  const mediumSeverityCount = securityReport.issues.filter(issue => issue.severity === 'medium').length;
  
  if (highSeverityCount > 0) {
    securityReport.overallRisk = 'high';
  } else if (mediumSeverityCount > 0) {
    securityReport.overallRisk = 'medium';
  }
  
  // Generate recommendations
  if (securityReport.issues.length > 0) {
    securityReport.recommendations = [
      'Review and address all identified security issues',
      'Implement regular security testing',
      'Consider a professional security audit'
    ];
  } else {
    securityReport.recommendations = [
      'Maintain current security practices',
      'Stay updated on latest security threats'
    ];
  }
  
  // Output the report
  console.log('%c Security Report ', 'background: #333; color: white; font-size: 12px; font-weight: bold; padding: 4px;');
  console.log('Issues found:', securityReport.issues.length);
  console.log('Checks passed:', securityReport.passedChecks.length);
  console.log('Overall risk level:', securityReport.overallRisk.toUpperCase());
  
  if (securityReport.issues.length > 0) {
    console.log('%c Issues ', 'background: #f44336; color: white; font-size: 12px; padding: 2px;');
    securityReport.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
      console.log(`   Risk: ${issue.risk}`);
      console.log(`   Recommendation: ${issue.recommendation}`);
    });
  }
  
  console.log('%c Recommendations ', 'background: #2196f3; color: white; font-size: 12px; padding: 2px;');
  securityReport.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  // Add to window for export if needed
  window._securityReport = securityReport;
  
  console.log('Complete security report available at window._securityReport');
  console.log('This report should NOT be included in production builds');
})();
