import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/Button";

export function ConfirmDialog({
  trigger,
  className,
  link,
  handleClick,
}: {
  trigger: React.ReactNode;
  className?: string;
  link?: string;
  handleClick: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger className={className}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="sm:max-w-[500px] overflow-hidden flex flex-col items-center justify-center">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription className="">
            This action cannot be undone. This vote will be committed
            permanently.
          </DialogDescription>
          {link ? (
            <a href={link}>
              <Button
                onClick={handleClick}
                className="bg-orange-400 w-[200px] border-b-8 h-12 mt-10 rounded-full active:border-b-0 hover:bg-amber-600 transition-all duration-200 border-b-orange-700 text-xl font-bold "
              >
                Confirm
              </Button>
            </a>
          ) : (
            <Button
              onClick={handleClick}
              className="bg-orange-400 w-[200px] border-b-8 h-12 mt-10 rounded-full active:border-b-0 hover:bg-amber-600 transition-all duration-200 border-b-orange-700 text-xl font-bold "
            >
              Confirm
            </Button>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
