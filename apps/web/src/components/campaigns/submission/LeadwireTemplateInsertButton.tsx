import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";
import {
  getLeadwireTemplateBody,
  PENDING_LEADWIRE_TEXT,
  type LeadwireCampaignTemplateKey,
} from "@/constants/leadwireCampaignTemplates";
import type { BrandSnapshot } from "@/types/campaign";
import { substituteLeadwireTemplate } from "@/utils/leadwireTemplateSubstitution";

interface LeadwireTemplateInsertButtonProps {
  templateKey: LeadwireCampaignTemplateKey;
  brandSnapshot: BrandSnapshot;
  disabled?: boolean;
  onInsert: (text: string) => void;
}

export function LeadwireTemplateInsertButton({
  templateKey,
  brandSnapshot,
  disabled = false,
  onInsert,
}: LeadwireTemplateInsertButtonProps) {
  const [pendingOpen, setPendingOpen] = useState(false);

  const handleClick = () => {
    const body = getLeadwireTemplateBody(templateKey);
    if (!body) {
      setPendingOpen(true);
      return;
    }

    onInsert(
      substituteLeadwireTemplate(body, {
        brandSnapshot,
      }),
    );
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={handleClick}
        disabled={disabled}
        sx={{ alignSelf: "flex-start" }}
      >
        Insertar plantilla Leadwire
      </Button>
      <Snackbar
        open={pendingOpen}
        autoHideDuration={5000}
        onClose={() => setPendingOpen(false)}
        message={PENDING_LEADWIRE_TEXT}
      />
    </>
  );
}
