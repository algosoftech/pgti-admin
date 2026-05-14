import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

const platforms = [
  {
    key: "youtube",
    label: "YouTube",
    color: "#FF0000",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "#1877F3",
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "#E1306C",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
  },
  {
    key: "twitter",
    label: "X.com",
    color: "#000000",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Twitter_X.png/640px-Twitter_X.png",
  },
];

const SocialMediaPopup = ({ open, onClose, socialData = {} }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box className="p-4">
        <Typography variant="h5" align="center" gutterBottom>
          Social Media Profiles
        </Typography>
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3}>
          {platforms.map((platform) => {
            const data = socialData[platform.key] || {};
            return (
              <Box
                key={platform.key}
                sx={{
                  minWidth: 220,
                  maxWidth: 260,
                  background: "#f8fafc",
                  borderRadius: 3,
                  boxShadow: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border: `2px solid ${platform.color}`,
                }}
              >
                <img
                  src={platform.icon}
                  alt={platform.label}
                  style={{ height: 40, marginBottom: 8 }}
                />
                <Typography variant="h6" style={{ color: platform.color }}>
                  {platform.label}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Followers: <b>{data.followers || "-"}</b>
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <img
                    src={
                      data.ratingImage ||
                      "https://cdn-icons-png.flaticon.com/512/616/616489.png"
                    }
                    alt="rating"
                    style={{ height: 20 }}
                  />
                  <Typography variant="body2">{data.rating || "-"}</Typography>
                </Box>
                {data.url && (
                  <Link
                    to={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 8,
                      // color: platform.color,
                      // textDecoration: "underline",
                      wordBreak: "break-all",
                      border: `2px solid ${platform.color}`,
                      fontSize: 14,
                      backgroundColor: platform.color,
                    }}
                    className="btn btn-primary"
                  >
                    View Profile
                  </Link>
                )}
              </Box>
            );
          })}
        </Box>
        <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
          <button onClick={onClose} className="btn btn-primary" variant="contained">
            Close
          </button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default SocialMediaPopup;
