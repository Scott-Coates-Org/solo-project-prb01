import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { createCombinedPlaylist, fetchSpotifyPlaylists } from "redux/spotify";

const CreateComboPlaylist = (props) => {
  const dispatch = useDispatch();
  const {
    data: userData,
    isLoaded: userIsLoaded,
    hasErrors: userHasErrors,
    errorMsg: userErrorMsg,
  } = useSelector((state) => state.user);
  const {
    data: spotifyData,
    isLoaded: spotifyIsLoaded,
    hasErrors: spotifyHasErrors,
    errorMsg: spotifyErrorMsg,
  } = useSelector((state) => state.spotify);

  // useEffect(() => {
  //   dispatch(fetchSpotifyPlaylists());
  // }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      playlist1: "",
      playlist2: "",
    },
  });

  const msgIfEmpty = (name = "") => `${name} cannot be empty`;

  const { ref: nameRef, ...nameRest } = register("name", {
    required: msgIfEmpty("Name"),
  });
  const { ref: playlist1Ref, ...playlist1Rest } = register("playlist1", {
    required: msgIfEmpty("Playlist"),
  });
  const { ref: playlist2Ref, ...playlist2Rest } = register("playlist2", {
    required: msgIfEmpty("Playlist"),
  });

  const onSubmit = (data) => {
    if (Object.keys(errors).length) {
      alert("Error saving product: " + JSON.stringify(errors));
    } else {
      dispatch(
        createCombinedPlaylist({
          uid: userData.uid,
          name: data.name,
          playlists: [data.playlist1, data.playlist2],
        })
      ).then(() => {
        reset();
        console.log("added to DB");
      });
    }
  };

  return (
    <>
      {!spotifyIsLoaded && "Form loading..."}
      {spotifyHasErrors && "Error Loading"}
      {spotifyIsLoaded && (
        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="p-3 my-3 border border-accent form-rounded bg-text"
        >
          <FormGroup>
            <Label for="name">
              New Combined Playlist Name<span className="text-danger">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              {...nameRest}
              innerRef={nameRef}
              invalid={errors.name ? true : false}
            />
          </FormGroup>
          <FormGroup>
            <Label for="playlist1">
              Playlist 1<span className="text-danger">*</span>
            </Label>
            <Input
              id="playlist1"
              type="select"
              {...playlist1Rest}
              innerRef={playlist1Ref}
              invalid={errors.playlists ? true : false}
            >
              <option value="" hidden></option>
              {spotifyData.playlists &&
                spotifyData.playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="playlist2">
              Playlist 2<span className="text-danger">*</span>
            </Label>
            <Input
              id="playlist2"
              type="select"
              {...playlist2Rest}
              innerRef={playlist2Ref}
              invalid={errors.playlists ? true : false}
            >
              <option value="" hidden></option>
              {spotifyData.playlists &&
                spotifyData.playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
            </Input>
          </FormGroup>

          <Button type="submit" color="secondary" className="text-primary">
            Save New Playlist
          </Button>
        </Form>
      )}
    </>
  );
};

export default CreateComboPlaylist;
