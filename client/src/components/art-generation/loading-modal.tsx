import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface LoadingModalProps {
  isOpen: boolean;
  progress: number;
}

export function LoadingModal({ isOpen, progress }: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md text-center">
        <DialogDescription className="sr-only">
          Modal de progresso para geração de arte
        </DialogDescription>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Gerando sua Arte
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Aguarde enquanto criamos sua arte personalizada...
        </p>
        <Progress value={progress} className="w-full" />
      </DialogContent>
    </Dialog>
  );
}
