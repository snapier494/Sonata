import createPostReply from '@/lib/neynar/createPostReply';
import getFeedFromTime from '@/lib/neynar/getFeedFromTime';
import { Cast } from '@neynar/nodejs-sdk/build/neynar-api/v2';
import { createClient } from '@supabase/supabase-js';
import { isEmpty, isNil } from 'lodash';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string;
const BOT_SIGNER_UUID = process.env.BOT_SIGNER_UUID as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const processEntriesInBatches = async (entries: any[], batchSize = 50) => {
  console.log('jobs::getMissingCasts', `${entries.length} new entries being added`);
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await Promise.all(batch.map((entry: any) => processSingleEntry(entry)));
  }
};

const processSingleEntry = async (cast: Cast) => {
  const address = cast?.author?.verifications ? cast?.author?.verifications : undefined;

  if (!isEmpty(address)) {
    await createCast(cast);
  }
};

const getResponse = async (): Promise<NextResponse> => {
  'use server';

  const dateFourHoursAgo = new Date();
  dateFourHoursAgo.setHours(dateFourHoursAgo.getHours() - 4);

  const lastChecked = dateFourHoursAgo;

  console.log('jobs::getMissingCasts', `Starting Job from ${lastChecked}`);

  const formattedLastChecked = new Date(`${lastChecked}`);

  const [spotify, soundCloud, soundxyz] = await Promise.all([
    getFeedFromTime('spotify.com/track', formattedLastChecked),
    getFeedFromTime('soundcloud.com', formattedLastChecked),
    getFeedFromTime('sound.xyz', formattedLastChecked),
  ]);
  const allEntries: any[] = [];
  allEntries.push(...spotify, ...soundCloud, ...soundxyz);

  console.log('jobs::getMissingCasts', `${allEntries.length} new entries`);
  if (allEntries.length > 0) {
    await processEntriesInBatches(allEntries);
  }

  return NextResponse.json({ message: 'success', allEntries }, { status: 200 });
};

async function createCast(cast: Cast) {
  const likes = (cast as any).reactions.likes_count;
  const parentUrl = cast.parent_url;
  let channelId = null;
  if (parentUrl) {
    const match = /\/channel\/([^/]+)$/.exec(parentUrl);
    if (match) {
      channelId = match[1];
    }
  }

  const { data: existingPosts } = await supabase
    .from('posts')
    .select()
    .eq('post_hash', cast.hash)
    .single();

  if (isNil(existingPosts) && isEmpty(existingPosts)) {
    const { data, error } = await supabase.from('posts').insert({
      post_hash: cast.hash,
      likes,
      created_at: new Date(cast.timestamp),
      embeds: cast.embeds,
      author: cast.author,
      channelId,
    });

    console.log('jobs::getMissingCasts', `Successfully created/updated ${cast.hash}`);

    console.log(data);
    if (error) {
      console.error('Error calling function:', error);
      return null;
    } else {
      sendBotCast(cast);
    }
  }

  return { success: true };
}

async function sendBotCast(cast: Cast) {
  await createPostReply(
    BOT_SIGNER_UUID,
    cast.hash,
    `This song is now available on @sonatatips where you earn NOTES when people tip you.\n\nSee you over there!\n\nhttps://sonata.tips/cast/${cast.author.username}/${cast.hash.substring(0, 8)}`,
  );

  return { success: true };
}

export async function GET(): Promise<Response> {
  const response = await getResponse().catch((error) => {
    console.error('Error in background task:', error);
  });
  return response as NextResponse;
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
