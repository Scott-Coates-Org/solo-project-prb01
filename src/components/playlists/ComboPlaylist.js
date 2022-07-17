import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";
import { useState } from "react";
import Playlist from "./Playlist";

const ComboPlaylist = ({ combinedPlaylist, idx }) => {
  const [open, setOpen] = useState("");
  const toggle = (id) => {
    open === id ? setOpen("") : setOpen(id);
  };

  return (
    <Accordion flush toggle={toggle} open={open}>
      <AccordionItem>
        <AccordionHeader targetId={idx}>{combinedPlaylist.name}</AccordionHeader>
        <AccordionBody accordionId={idx}>
          {combinedPlaylist.playlists.map((playlist, playlistIdx) => (
            <Playlist key={playlist.id} playlist={playlist} idx={playlistIdx} />
          ))}
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );
};

export default ComboPlaylist;
