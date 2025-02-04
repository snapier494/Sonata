import Title from '@/components/Header/Title';
import { boldFont, regularFont } from '@/lib/fonts';

export const runtime = 'edge';

export async function GET() {
  const [regularFontData, boldFontData] = await Promise.all([regularFont, boldFont]);

  const { ImageResponse } = await import('@vercel/og');
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          fontFamily: '"HelveticaBold"',
        }}
        tw="flex gap-3"
      >
        <Title />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Helvetica',
          data: regularFontData,
          weight: 400,
        },
        {
          name: 'HelveticaBold',
          data: boldFontData,
          weight: 700,
        },
      ],
    },
  );
}
