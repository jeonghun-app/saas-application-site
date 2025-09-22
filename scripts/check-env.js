#!/usr/bin/env node

const requiredEnvVars = [
  'AWS_REGION',
  'DYNAMODB_TABLE_NAME',
  'NEXT_PUBLIC_CONTROL_PLANE_URL',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_DOMAIN'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_USING_CUSTOM_DOMAIN',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_VERSION'
];

console.log('🔍 Environment Variables Check');
console.log('================================');

let hasErrors = false;

// 필수 환경 변수 체크
console.log('\n📋 Required Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
    hasErrors = true;
  }
});

// 선택적 환경 변수 체크
console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`⚠️  ${envVar}: NOT SET (using default)`);
  }
});

// AWS 자격 증명 체크
console.log('\n🔐 AWS Credentials Check:');
const awsCredentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
};

if (awsCredentials.accessKeyId && awsCredentials.secretAccessKey) {
  console.log('✅ AWS credentials: Set via environment variables');
} else {
  console.log('⚠️  AWS credentials: Using IAM role (recommended for EC2)');
}

if (awsCredentials.region) {
  console.log(`✅ AWS region: ${awsCredentials.region}`);
} else {
  console.log('❌ AWS region: NOT SET');
  hasErrors = true;
}

// Node.js 환경 체크
console.log('\n🟢 Node.js Environment:');
console.log(`✅ Node.js version: ${process.version}`);
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// 메모리 사용량 체크
const memUsage = process.memoryUsage();
console.log(`✅ Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

// 결과 출력
console.log('\n================================');
if (hasErrors) {
  console.log('❌ Environment check FAILED');
  console.log('Please set the missing required environment variables.');
  process.exit(1);
} else {
  console.log('✅ Environment check PASSED');
  console.log('All required environment variables are set.');
}
