import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { createCombinedPlaylist } from "redux/spotify";

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
      playlist1: {},
      playlist2: {},
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
      console.log(data.playlist1)

      dispatch(
        createCombinedPlaylist({
          uid: userData.uid,
          name: data.name,
          spotifyId: spotifyData.user.id,
          access_token: userData.access_token,
          playlists: [JSON.parse(data.playlist1), JSON.parse(data.playlist2)],
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
          className="p-3 my-3 border border-accent form-rounded text-text"
        >
          <h2 className="text-center mb-4">New Combined Playlist</h2>
          <FormGroup row>
            <Label for="name" sm={2}>
              Name<span className="text-danger">*</span>
            </Label>
            <Col sm={10}>
              <Input
                id="name"
                type="text"
                {...nameRest}
                innerRef={nameRef}
                invalid={errors.name ? true : false}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="playlist1" sm={2}>
              Playlist 1<span className="text-danger">*</span>
            </Label>
            <Col sm={10}>
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
                    <option
                      key={playlist.id}
                      value={JSON.stringify({ name: playlist.name, id: playlist.id })}
                    >
                      {playlist.name}
                    </option>
                  ))}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="playlist2" sm={2}>
              Playlist 2<span className="text-danger">*</span>
            </Label>
            <Col sm={10}>
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
                    <option
                      key={playlist.id}
                      value={JSON.stringify({ name: playlist.name, id: playlist.id })}
                    >
                      {playlist.name}
                    </option>
                  ))}
              </Input>
            </Col>
          </FormGroup>
          <div className="d-flex justify-content-center">
            <Button type="submit" color="secondary" className="text-primary">
              Save New Playlist
            </Button>
          </div>
        </Form>
      )}
    </>
  );
};

export default CreateComboPlaylist;
