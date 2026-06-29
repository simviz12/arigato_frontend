import fs from 'fs';
import path from 'path';

describe('React Route Security Audit', () => {
  it('should ensure all /admin routes are wrapped in RoleGuard', () => {
    const appTsxPath = path.join(__dirname, '../src/App.tsx');
    const content = fs.readFileSync(appTsxPath, 'utf-8');

    // Simple static analysis checking if the <Route path="/admin/*" ...> is nested inside RoleGuard
    
    // 1. Verify RoleGuard is imported
    expect(content).toContain('import { RoleGuard } from \'./components/RoleGuard\'');

    // 2. Extract the block where admin routes are defined
    const adminRouteMatch = content.match(/<Route path="\/admin\/\*"[^>]*>([\s\S]*?)<\/Route>/);
    expect(adminRouteMatch).toBeTruthy();
    
    // 3. Find the parent Route that wraps the admin route.
    // In our App.tsx, we have:
    // <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
    //   <Route path="/admin/*" ...
    
    // We can just regex check that '<Route path="/admin/*"' is preceded by '<Route element={<RoleGuard allowedRoles={[\'ADMIN\']} />}>'
    const roleGuardAdminRegex = /<Route element={<RoleGuard allowedRoles={\['ADMIN'\]} \/>}>\s*<Route path="\/admin\/\*"/;
    
    expect(content).toMatch(roleGuardAdminRegex);

    // 4. Verify POS route has CASHIER and ADMIN access
    const roleGuardPosRegex = /<Route element={<RoleGuard allowedRoles={\['CASHIER', 'ADMIN'\]} \/>}>\s*<Route path="\/pos"/;
    expect(content).toMatch(roleGuardPosRegex);
  });
});
