#!/bin/bash
echo "Running Stress Test (A7)..."
node scripts/stress_test.js
echo "Running Idempotency Test (B10)..."
node scripts/idempotency_test.js
