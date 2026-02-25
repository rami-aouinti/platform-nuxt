# Changelog

## Unreleased

### Documentation

- Clarified the API key versioning decision: no `/api/v2/api_key/*` contract is published because no breaking evolution exists yet versus v1.
- Added migration guidance to keep using `/api/v1/api_key/*` and roll back any premature `/api/v2/api_key/*` integrations.
