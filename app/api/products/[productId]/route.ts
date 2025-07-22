import { NextRequest, NextResponse } from 'next/server';
import { 
  DynamoDBClient, 
  GetItemCommand, 
  PutItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-northeast-2',
  // EC2 인스턴스에서 IAM 역할 자격 증명 사용
  credentials: undefined, // 기본 자격 증명 체인 사용
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'product';

interface RouteParams {
  params: Promise<{
    productId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    console.log('🗄️ DynamoDB Product GET Request for productId:', productId, 'tenantId:', tenantId);

    // tenantId#productId 형태의 실제 키 생성
    const fullProductId = productId.includes('#') ? productId : `${tenantId}#${productId}`;

    const getParams = {
      TableName: TABLE_NAME,
      Key: marshall({
        id: fullProductId
      })
    };

    const command = new GetItemCommand(getParams);
    const result = await client.send(command);

    if (!result.Item) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = unmarshall(result.Item);
    console.log('🗄️ DynamoDB Get Success:', fullProductId);

    return NextResponse.json(product, {
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    console.log('🗄️ DynamoDB Product PUT Request for productId:', productId, 'tenantId:', tenantId);

    // tenantId#productId 형태의 실제 키 생성
    const fullProductId = productId.includes('#') ? productId : `${tenantId}#${productId}`;

    const updatedItem = {
      id: fullProductId,
      name: body.name,
      description: body.description,
      currency: body.currency,
      interestRate: body.interestRate,
      tenantId: tenantId,
      updatedAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: TABLE_NAME,
      Item: marshall(updatedItem),
    };

    const command = new PutItemCommand(putParams);
    await client.send(command);

    console.log('🗄️ DynamoDB Put Success:', fullProductId);

    return NextResponse.json(updatedItem, {
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    console.log('🗄️ DynamoDB Product DELETE Request for productId:', productId, 'tenantId:', tenantId);

    // tenantId#productId 형태의 실제 키 생성
    const fullProductId = productId.includes('#') ? productId : `${tenantId}#${productId}`;

    const deleteParams = {
      TableName: TABLE_NAME,
      Key: marshall({
        id: fullProductId
      })
    };

    const command = new DeleteItemCommand(deleteParams);
    await client.send(command);

    console.log('🗄️ DynamoDB Delete Success:', fullProductId);

    return NextResponse.json({ message: 'Product deleted successfully' }, {
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