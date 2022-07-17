import { Container } from "reactstrap";
import ComboPlaylist from "./ComboPlaylist";

const ListOfComboPlaylists = (props) => {
  const spotifyIsLoaded = true;
  const spotifyHasErrors = false;

  return (
    <>
      {!spotifyIsLoaded && "Form loading..."}
      {spotifyHasErrors && "Error Loading"}
      {spotifyIsLoaded && (
        <Container className="p-3 my-3 border border-accent form-rounded text-text">
          
        </Container>
      )}
    </>
  );
};

export default ListOfComboPlaylists;
