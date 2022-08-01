import { useState } from "react";
import Playlist from "./Playlist";
import { useDispatch, useSelector } from "react-redux";
import { deleteCombinedPlaylist } from "redux/spotify";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Row,
  Col,
} from "reactstrap";

const ComboPlaylist = ({ combinedPlaylist, idx }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState("");
  const access_token = useSelector(state => state.user?.data?.access_token)

  const toggle = (id) => {
    open === id ? setOpen("") : setOpen(id);
  };

  const deleteComboPlaylist = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      dispatch(deleteCombinedPlaylist({ id, access_token }));
    }
  };

  return (
    <Accordion flush toggle={toggle} open={open}>
      <AccordionItem className="bg-secondary">
        <AccordionHeader targetId={idx}>
          <h5>{combinedPlaylist.name}</h5>
        </AccordionHeader>
        <AccordionBody accordionId={idx}>
          <Row className="gy-4">
            <Col sm={10}>
              {combinedPlaylist.playlists.map((playlist, playlistIdx) => (
                <Playlist key={playlist.id} playlist={playlist} idx={playlistIdx} />
              ))}
            </Col>
            <Col sm={2}>
              <Button color="accent" onClick={() => deleteComboPlaylist(idx)}>
                Delete
              </Button>
            </Col>
          </Row>
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );
};

export default ComboPlaylist;
