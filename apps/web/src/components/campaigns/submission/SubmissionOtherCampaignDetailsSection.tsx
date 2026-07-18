import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Checkbox from "@mui/material/Checkbox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { ContentAttributes } from "@/types/campaign";

const emptyAttrs: ContentAttributes = {
  embeddedLinks: false,
  phoneNumbers: false,
  ageGated: false,
  affiliateMarketing: false,
};

interface SubmissionOtherCampaignDetailsSectionProps {
  contentAttributes: ContentAttributes;
  estimatedSubscriberVolume: string;
  editable: boolean;
  disabled: boolean;
  onContentAttributesChange: (attrs: ContentAttributes) => void;
  onEstimatedVolumeChange: (value: string) => void;
}

export function SubmissionOtherCampaignDetailsSection({
  contentAttributes,
  estimatedSubscriberVolume,
  editable,
  disabled,
  onContentAttributesChange,
  onEstimatedVolumeChange,
}: SubmissionOtherCampaignDetailsSectionProps) {
  const fieldsDisabled = !editable || disabled;

  return (
    <Accordion sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Other Campaign Details</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle2">Content attributes</Typography>
          {(Object.keys(emptyAttrs) as Array<keyof ContentAttributes>).map(
            (key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={contentAttributes[key]}
                    disabled={fieldsDisabled}
                    onChange={(e) =>
                      onContentAttributesChange({
                        ...contentAttributes,
                        [key]: e.target.checked,
                      })
                    }
                  />
                }
                label={key}
              />
            ),
          )}

          <TextField
            label="Estimated subscriber volume"
            value={estimatedSubscriberVolume}
            onChange={(e) => onEstimatedVolumeChange(e.target.value)}
            disabled={fieldsDisabled}
            fullWidth
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
