import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Farmnport - Buy & Sell Farm Produce Directly in Zimbabwe'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            farmnport
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Buy & Sell Farm Produce Directly in Zimbabwe
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            {['Livestock', 'Crops', 'Agrochemicals', 'Animal Health', 'Feed'].map((tag) => (
              <div
                key={tag}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: 20,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          farmnport.com
        </div>
      </div>
    ),
    { ...size }
  )
}
