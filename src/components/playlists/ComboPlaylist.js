import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";

const ComboPlaylist = (props) => {
  const [open, setOpen] = useState("");
  const toggle = (id) => {
    open === id ? setOpen() : setOpen(id);
  };

  return (
    <Accordion flush toggle={toggle} open={open}>
      <AccordionItem>
        <AccordionHeader targetId={props.idx}></AccordionHeader>
        <AccordionBody>
          {props.playlists.map((playlist) => (
            <Playlist playlist={playlist} />
          ))}
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );
};

export default ComboPlaylist;
