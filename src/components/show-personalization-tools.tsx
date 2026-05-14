'use client';

import React from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type StoredShow,
  isInMyList,
  recordRecentlyViewed,
  toggleMyList,
} from '@/lib/personalization';
import { useAuthStore } from '@/stores/auth';

interface ShowPersonalizationToolsProps {
  show: StoredShow;
}

export default function ShowPersonalizationTools({
  show,
}: ShowPersonalizationToolsProps) {
  const [saved, setSaved] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const openDialog = useAuthStore((state) => state.openDialog);
  const pendingMyListShow = useAuthStore((state) => state.pendingMyListShow);
  const clearPendingMyListShow = useAuthStore(
    (state) => state.clearPendingMyListShow,
  );

  React.useEffect(() => {
    recordRecentlyViewed(show);
    setSaved(isInMyList(show.id));
  }, [show, user, hydrated]);

  React.useEffect(() => {
    if (!user || pendingMyListShow?.id !== show.id || isInMyList(show.id)) {
      return;
    }

    setSaved(toggleMyList(show));
    clearPendingMyListShow();
  }, [clearPendingMyListShow, pendingMyListShow, show, user]);

  return (
    <Button
      type="button"
      variant={saved ? 'outline' : 'default'}
      onClick={() => {
        if (!user) {
          openDialog('register', show);
          return;
        }
        setSaved(toggleMyList(show));
      }}
      className="border-white/15 h-auto rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:text-white">
      {saved ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          In My List
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Add to My List
        </>
      )}
    </Button>
  );
}
