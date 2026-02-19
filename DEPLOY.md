# Deploy Frontend to Production

## Quick Deploy

Tell Claude Code:
- **"Deploy frontend version 1.5.0 to production"**
- **"Build and deploy frontend v1.5.0"**
- **"Deploy client-fnp and admin-fnp to production"**

## What Claude Code Will Do

1. Build both applications (client-fnp and admin-fnp) with bun
2. Push git tag to trigger CI/CD build
3. Wait for GitHub Actions to build Docker images
4. Update Kubernetes deployment in `../ops/frontend/deployment.yaml`
5. Apply deployment: `kubectl apply -f ../ops/frontend/deployment.yaml`
6. Verify rollout: `kubectl rollout status deployment/frontend -n gateways`
7. Check logs and confirm healthy deployment

## Manual Deploy Steps

```bash
# 1. Build applications locally
cd frontend/apps/client-fnp
bun run build

cd ../admin-fnp
bun run build

# 2. Tag version
cd ../..
git tag v1.5.0
git push origin frontend-v1.5.0

# 3. Wait for GitHub Actions to complete
# Monitor: https://github.com/pajecha/farmnport/actions

# 4. Update and apply Kubernetes deployment
cd ../ops/frontend
# Edit deployment.yaml - update image version to 1.5.0
kubectl apply -f deployment.yaml

# 5. Verify
kubectl rollout status deployment/frontend -n gateways
kubectl logs -f deployment/frontend -n gateways
```

## Rollback

```bash
kubectl rollout undo deployment/frontend -n gateways
```

## Notes

- The frontend deployment includes both client-fnp and admin-fnp applications
- Client-fnp runs on the main domain (farmnport.com)
- Admin-fnp runs on the admin subdomain (admin.farmnport.com)
- Both applications are built as a single Docker image with Next.js standalone output
- Environment variables are managed via ConfigMap (`frontend-config`) and Secret (`nextauth-secret`)

---

**Full deployment documentation:** `../ops/PRODUCTION_DEPLOYMENT.md`
