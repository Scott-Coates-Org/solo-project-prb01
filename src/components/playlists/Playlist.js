import { Col, Row } from "reactstrap";

const Playlist = ({ playlist, idx }) => {
  return (
    <Row className="text-primary">
      <Col xs={1}>{idx + 1}</Col>
      <Col xs={11}>{playlist.name}</Col>
    </Row>
  );
};

export default Playlist;
