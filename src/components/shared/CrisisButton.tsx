'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import CrisisModal from './CrisisModal';

export default function CrisisButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700"
      >
        <Heart className="h-4 w-4 mr-2" />
        Need Help
      </Button>
      <CrisisModal open={open} onOpenChange={setOpen} />
    </>
  );
}
