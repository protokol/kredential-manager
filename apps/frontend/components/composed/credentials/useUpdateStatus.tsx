import { useState } from 'react';

const useUpdateStatus = () => {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  return {
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    isOfferDialogOpen,
    setIsOfferDialogOpen
  };
};

export default useUpdateStatus;
