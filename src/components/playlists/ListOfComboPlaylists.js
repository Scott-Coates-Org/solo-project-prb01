import { Container } from "reactstrap";
import ComboPlaylist from "./ComboPlaylist";

const ListOfComboPlaylists = ({ combinedPlaylists }) => {
  const spotifyIsLoaded = true;
  const spotifyHasErrors = false;

  if (!combinedPlaylists) return null

    return (
      <>
        {!spotifyIsLoaded && "Form loading..."}
        {spotifyHasErrors && "Error Loading"}
        {spotifyIsLoaded && (
          <Container className="p-3 my-3 border border-accent form-rounded text-text d-grid gap-3">
            {combinedPlaylists.map((combinedPlaylist) => (
              <ComboPlaylist
                key={combinedPlaylist.id}
                combinedPlaylist={combinedPlaylist}
                idx={combinedPlaylist.id}
              />
            ))}
          </Container>
        )}
      </>
    );
};

export default ListOfComboPlaylists;
