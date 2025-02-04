'use client';
import { useNeynarProvider } from '@/providers/NeynarProvider';
import Image from 'next/image';

const SignInButton = () => {
  const { signIn } = useNeynarProvider();

  return (
    <button
      onClick={signIn}
      className="flex items-center gap-2 rounded-md bg-farcaster px-4 py-2 font-light text-white"
    >
      <div className="w-8">
        <Image src="/images/farcaster.svg" width={323} height={297} alt="" />
      </div>
      Sign In
    </button>
  );
};

export default SignInButton;
