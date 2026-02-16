# Healthy-mobility

## Live prices and discounts (Amazon)

The shop can load dynamic prices from `prices.json` and show discounts.

### Automatic updates (GitHub Actions)

1. Open GitHub repository settings.
2. Add repository secrets:
   - `AMAZON_ACCESS_KEY_ID`
   - `AMAZON_SECRET_ACCESS_KEY`
   - `AMAZON_PARTNER_TAG` (your Amazon Associates tracking ID)
3. Optional repository variables:
   - `AMAZON_REGION` (default: `eu-west-1`)
   - `AMAZON_MARKETPLACE` (default: `www.amazon.de`)
   - `AMAZON_HOST` (default: `webservices.amazon.de`)
4. The workflow `.github/workflows/update-amazon-prices.yml` runs every 6 hours and updates `prices.json`.

### Manual run

Use GitHub Actions `Update Amazon Prices` and trigger `Run workflow`.
