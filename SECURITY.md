# Security Guide

This document outlines the security measures implemented in the Vigor application and best practices for maintaining a secure system.

## Security Features Implemented

### 1. Authentication & Authorization

#### JWT-Based Authentication

- **Access Tokens**: Short-lived (15 minutes) for API requests
- **Refresh Tokens**: Long-lived (7 days) stored securely in database
- **Token Rotation**: Refresh tokens are rotated on each use
- **Secure Storage**: Tokens stored with encryption in database

#### Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Strength Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

#### Account Protection

- **Account Lockout**: 5 failed login attempts within 15 minutes
- **Audit Logging**: All authentication events logged
- **Session Management**: Secure session handling with expiration

### 2. Data Protection

#### Encryption

- **At Rest**: Sensitive data encrypted using AES-256-GCM
- **In Transit**: All communications over HTTPS/TLS 1.2+
- **Database**: Prepared statements prevent SQL injection

#### Input Validation

- **Server-Side Validation**: All inputs validated using express-validator
- **Sanitization**: XSS prevention through input sanitization
- **Type Checking**: Strong typing with TypeScript

### 3. Network Security

#### HTTPS/TLS

- **SSL/TLS**: TLS 1.2 and 1.3 only
- **Certificate**: Let's Encrypt or commercial SSL certificate
- **HSTS**: HTTP Strict Transport Security enabled
- **Cipher Suites**: Strong ciphers only

#### CORS (Cross-Origin Resource Sharing)

- **Whitelist**: Only specified origins allowed
- **Credentials**: Cookies allowed only from trusted origins
- **Methods**: Limited to necessary HTTP methods

#### Rate Limiting

- **API Endpoints**: 100 requests per 15 minutes
- **Authentication**: 5 requests per minute
- **IP-Based**: Limits applied per IP address

### 4. Application Security

#### Security Headers

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

#### CSRF Protection

- **Double-Submit Cookie Pattern**: CSRF tokens in cookies and headers
- **SameSite Cookies**: Cookies set with SameSite=Strict
- **Token Validation**: All state-changing requests validated

#### SQL Injection Prevention

- **Parameterized Queries**: All database queries use parameters
- **ORM/Query Builder**: Structured query building
- **Input Sanitization**: Additional layer of SQL input sanitization

#### XSS Prevention

- **Output Encoding**: All user input encoded before display
- **Content Security Policy**: Restricts script sources
- **Input Sanitization**: HTML tags and scripts stripped

### 5. Monitoring & Logging

#### Audit Logging

All security-relevant events are logged:

- Login attempts (successful and failed)
- Account lockouts
- Password changes
- Token refresh
- Suspicious activity
- API access patterns

#### Log Contents

- User ID
- IP Address
- User Agent
- Timestamp
- Action performed
- Result (success/failure)
- Additional metadata

## Security Best Practices

### For Developers

#### 1. Environment Variables

```bash
# Never commit .env files
# Use strong, unique secrets
# Rotate secrets regularly
# Use different secrets for dev/staging/production
```

#### 2. Password Handling

```typescript
// ✅ GOOD: Use bcrypt
const hash = await bcrypt.hash(password, 12);

// ❌ BAD: Never store plain text
const password = user.password; // NEVER DO THIS
```

#### 3. Database Queries

```typescript
// ✅ GOOD: Parameterized queries
await db.query("SELECT * FROM users WHERE email = $1", [email]);

// ❌ BAD: String concatenation
await db.query(`SELECT * FROM users WHERE email = '${email}'`); // NEVER DO THIS
```

#### 4. Error Handling

```typescript
// ✅ GOOD: Generic error messages
res.status(401).json({ message: "Invalid credentials" });

// ❌ BAD: Specific error messages
res.status(401).json({ message: "User not found" }); // Reveals information
```

### For Administrators

#### 1. Regular Updates

- Keep all dependencies updated
- Monitor security advisories
- Apply patches promptly
- Review npm audit regularly

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

#### 2. Access Control

- Use principle of least privilege
- Regularly review user permissions
- Disable inactive accounts
- Implement role-based access control

#### 3. Backup Strategy

- Daily automated backups
- Encrypted backup storage
- Test restore procedures
- Off-site backup storage

#### 4. Monitoring

- Set up alerts for suspicious activity
- Monitor failed login attempts
- Track API usage patterns
- Review audit logs regularly

## Security Checklist

### Pre-Deployment

- [ ] All environment variables use strong, unique values
- [ ] SSL/TLS certificates are properly configured
- [ ] Database credentials are strong and unique
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is enabled and tested
- [ ] All dependencies are up to date
- [ ] Security headers are configured
- [ ] CSRF protection is enabled
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive information

### Post-Deployment

- [ ] Change default admin password
- [ ] Enable firewall
- [ ] Configure automated backups
- [ ] Set up monitoring and alerting
- [ ] Review audit logs
- [ ] Test authentication flows
- [ ] Verify SSL/TLS configuration
- [ ] Test rate limiting
- [ ] Verify CORS configuration
- [ ] Document security procedures

### Ongoing Maintenance

- [ ] Weekly: Review audit logs
- [ ] Weekly: Check for failed login attempts
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review user accounts
- [ ] Quarterly: Security audit
- [ ] Quarterly: Penetration testing
- [ ] Annually: Rotate secrets
- [ ] Annually: Review security policies

## Incident Response

### Suspected Breach

1. **Immediate Actions**

   ```bash
   # Disable affected accounts
   # Rotate all secrets
   # Review audit logs
   # Check for unauthorized access
   ```

2. **Investigation**
   - Review audit logs for suspicious activity
   - Check database for unauthorized changes
   - Analyze network traffic
   - Identify attack vector

3. **Remediation**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Notify affected users
   - Document incident

4. **Prevention**
   - Implement additional security measures
   - Update security procedures
   - Train team on new threats
   - Conduct security review

### Failed Login Monitoring

```sql
-- Check for brute force attempts
SELECT
  metadata->>'email' as email,
  ip_address,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM audit_logs
WHERE action = 'failed_login'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'email', ip_address
HAVING COUNT(*) > 5
ORDER BY attempts DESC;
```

### Suspicious Activity Detection

```sql
-- Check for unusual access patterns
SELECT
  user_id,
  ip_address,
  COUNT(DISTINCT path) as unique_endpoints,
  COUNT(*) as total_requests,
  MIN(created_at) as first_request,
  MAX(created_at) as last_request
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 100
ORDER BY total_requests DESC;
```

## Compliance

### Data Protection

- **GDPR**: User data rights implemented
- **Data Minimization**: Only necessary data collected
- **Right to Deletion**: User data can be deleted
- **Data Portability**: User data can be exported

### Password Requirements

- Minimum 8 characters
- Complexity requirements enforced
- Regular password rotation recommended
- Password history maintained

### Audit Trail

- All security events logged
- Logs retained for 90 days minimum
- Tamper-proof logging
- Regular log reviews

## Security Tools

### Recommended Tools

1. **OWASP ZAP**: Web application security scanner
2. **npm audit**: Dependency vulnerability scanner
3. **Snyk**: Continuous security monitoring
4. **Let's Encrypt**: Free SSL/TLS certificates
5. **Fail2ban**: Intrusion prevention

### Running Security Scans

```bash
# Dependency audit
npm audit

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://yourdomain.com

# SSL/TLS test
testssl.sh https://yourdomain.com
```

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email security@yourdomain.com with details
3. Include steps to reproduce
4. Allow reasonable time for fix before disclosure
5. We will acknowledge within 48 hours

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

## Version History

- **v1.0.0** (2026-01-29): Initial security implementation
  - JWT authentication
  - Password hashing
  - Rate limiting
  - CSRF protection
  - Audit logging
  - Input validation
  - SQL injection prevention
  - XSS prevention
