import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export class ApiErrorHandler {
  static handle(error: unknown): NextResponse {
    console.error('API Error:', error);

    // DynamoDB 에러 처리
    if (error instanceof Error) {
      if (error.message.includes('AccessDeniedException')) {
        return NextResponse.json(
          { 
            error: 'Database access denied', 
            message: 'Please check your permissions',
            code: 'ACCESS_DENIED'
          },
          { status: 403 }
        );
      }
      
      if (error.message.includes('ResourceNotFoundException')) {
        return NextResponse.json(
          { 
            error: 'Database table not found', 
            message: 'Please contact administrator',
            code: 'RESOURCE_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('ThrottlingException')) {
        return NextResponse.json(
          { 
            error: 'Database is busy', 
            message: 'Please try again later',
            code: 'THROTTLING'
          },
          { status: 429 }
        );
      }
      
      if (error.message.includes('ValidationException')) {
        return NextResponse.json(
          { 
            error: 'Invalid request data', 
            message: error.message,
            code: 'VALIDATION_ERROR'
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('ConditionalCheckFailedException')) {
        return NextResponse.json(
          { 
            error: 'Resource conflict', 
            message: 'The resource already exists or has been modified',
            code: 'CONFLICT'
          },
          { status: 409 }
        );
      }
      
      if (error.message.includes('ProvisionedThroughputExceededException')) {
        return NextResponse.json(
          { 
            error: 'Database capacity exceeded', 
            message: 'Please try again later',
            code: 'THROUGHPUT_EXCEEDED'
          },
          { status: 429 }
        );
      }
    }

    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error', 
          message: 'Unable to connect to external service',
          code: 'NETWORK_ERROR'
        },
        { status: 503 }
      );
    }

    // 기본 500 에러
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // 재시도하지 않을 에러들
        if (error instanceof Error) {
          if (error.message.includes('AccessDeniedException') ||
              error.message.includes('ResourceNotFoundException') ||
              error.message.includes('ValidationException')) {
            throw error;
          }
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        console.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 지수 백오프
      }
    }
    
    throw lastError;
  }
}

// 환경 변수 검증
export function validateEnvironmentVariables(): { isValid: boolean; missing: string[] } {
  const required = [
    'AWS_REGION',
    'DYNAMODB_TABLE_NAME',
    'NEXT_PUBLIC_CONTROL_PLANE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// 헬스 체크 함수
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  checks: {
    environment: boolean;
    database?: boolean;
    externalApi?: boolean;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const checks = {
    environment: false,
    database: false,
    externalApi: false
  };

  // 환경 변수 체크
  const envCheck = validateEnvironmentVariables();
  if (envCheck.isValid) {
    checks.environment = true;
  } else {
    errors.push(`Missing environment variables: ${envCheck.missing.join(', ')}`);
  }

  // 데이터베이스 연결 체크 (선택적)
  try {
    // 여기서 실제 DB 연결 테스트를 수행할 수 있습니다
    checks.database = true;
  } catch {
    errors.push('Database connection failed');
  }

  // 외부 API 체크 (선택적)
  try {
    const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;
    if (controlPlaneUrl) {
      const response = await fetch(`${controlPlaneUrl}health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });
      checks.externalApi = response.ok;
    }
  } catch {
    errors.push('External API connection failed');
  }

  return {
    status: errors.length === 0 ? 'healthy' : 'unhealthy',
    checks,
    errors
  };
}
