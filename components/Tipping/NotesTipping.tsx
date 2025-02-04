import { CloseModal } from '@/types/Modal';
import { useState } from 'react';
import { useToast } from '../ui/use-toast';

const NotesTipping = ({ closeModal }: { closeModal: CloseModal }) => {
  const { toast } = useToast();
  const [degenAmount, setDegenAmount] = useState<string>('');

  const submitTip = (amount?: number) => {
    const finalAmount = amount ? amount.toString() : degenAmount;
    toast({ description: `You tipped ${finalAmount} NOTES` });
    closeModal();
  };

  return (
    <div>
      <div className="text-sm">50,000 Available</div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <button className="rounded bg-blue-500 text-white" onClick={() => submitTip(100)}>
          Tip 100 NOTES
        </button>
        <button className="rounded bg-blue-500 text-white" onClick={() => submitTip(1000)}>
          Tip 1000 NOTES
        </button>
        <button className="rounded bg-blue-500 text-white" onClick={() => submitTip(10000)}>
          Tip 10000 NOTES
        </button>
        <div>
          <input
            type="text"
            placeholder="Custom amount"
            value={degenAmount}
            onChange={(e) => setDegenAmount(e.target.value)}
            className="w-full rounded border-2 border-gray-300 text-sm"
          />
          <button
            className="mt-1 w-full rounded bg-blue-500 text-white"
            onClick={() => submitTip()}
          >
            Submit Custom Tip
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesTipping;
