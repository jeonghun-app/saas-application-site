import { NextRequest, NextResponse } from 'next/server';
import { 
  DynamoDBClient, 
  ScanCommand, 
  PutItemCommand,
  ScanCommandInput 
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-northeast-2',
  // EC2 인스턴스에서 IAM 역할 자격 증명 사용
  credentials: undefined, // 기본 자격 증명 체인 사용
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    console.log('🗄️ DynamoDB Products GET Request for tenantId:', tenantId);

    // tenant별 상품 조회 (id가 tenantId#로 시작하는 항목들)
    const scanParams: ScanCommandInput = {
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(id, :tenantPrefix)',
      ExpressionAttributeValues: {
        ':tenantPrefix': { S: `${tenantId}#` }
      }
    };

    const command = new ScanCommand(scanParams);
    const result = await client.send(command);

    console.log('🗄️ DynamoDB Query Success:', result.Items?.length, 'items found');

    // DynamoDB 형태를 애플리케이션 형태로 변환
    const products = (result.Items || []).map(item => {
      const unmarshalled = unmarshall(item);
      return {
        id: unmarshalled.id,
        name: unmarshalled.name,
        description: unmarshalled.description,
        currency: unmarshalled.currency,
        interestRate: unmarshalled.interestRate,
        tenantId: unmarshalled.tenantId,
        createdAt: unmarshalled.createdAt,
        updatedAt: unmarshalled.updatedAt,
      };
    });

    return NextResponse.json(products, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('🗄️ DynamoDB error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    console.log('🗄️ DynamoDB Products POST Request for tenantId:', tenantId);
    console.log('🗄️ Request body:', body);

    // tenantId#상품명 형태의 ID 생성
    const productId = `${tenantId}#${body.name}`;
    const now = new Date().toISOString();

    const item = {
      id: productId,
      name: body.name,
      description: body.description,
      currency: body.currency,
      interestRate: body.interestRate,
      tenantId: tenantId,
      createdAt: now,
      updatedAt: now,
    };

    const putParams = {
      TableName: TABLE_NAME,
      Item: marshall(item),
    };

    const command = new PutItemCommand(putParams);
    await client.send(command);

    console.log('🗄️ DynamoDB Put Success:', productId);

    return NextResponse.json(item, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('🗄️ DynamoDB error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 