import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Menu, HelpCircle } from "lucide-react";

export default function Sidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="text-white" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 p-4 z-[500] flex flex-col justify-between"
      >
        <div>
          <SheetHeader>
            <SheetTitle>Features instruction</SheetTitle>
            <SheetDescription>
              You can always ask your doubts to our AI agent NavIn. You can turn
              the agent on or off from the Navbar.
            </SheetDescription>
          </SheetHeader>
          <ul className="list-disc pl-5 space-y-2 text-sm mt-4">
            <li>Real-time AI-powered voice assistance</li>
            <li>Help and support</li>
            <li>Multilingual support</li>
            <li>Top tier security</li>
            <li>Digitalized system</li>
          </ul>  
        </div>
        <div className="mt-6">
          <Button className="w-full flex items-center gap-2">
            <HelpCircle size={16} /> Help & Support
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
