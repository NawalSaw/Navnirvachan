"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface BulletinDialogProps {
  open: boolean;
  ballotId: string;
  ballotHash: string;
  bulletinId: string;
  handleOk: () => void;
}

const BulletinDialog = ({
  open,
  ballotId,
  ballotHash,
  bulletinId,
  handleOk
}: BulletinDialogProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-[#111726] text-white border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Vote Receipt Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <div>
            <p className="text-gray-400 text-sm">Ballot ID</p>
            <p className="font-mono break-all">{ballotId}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Ballot Hash</p>
            <p className="font-mono break-all">{ballotHash}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Bulletin ID</p>
            <p className="font-mono break-all">{bulletinId}</p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleOk}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulletinDialog;
