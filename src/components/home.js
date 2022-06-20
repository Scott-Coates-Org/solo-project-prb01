import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { createWidget, fetchAllWidgets, savePhoto } from "redux/widget";
import Layout from './layout';

export default function Home(props) {
  const dispatch = useDispatch();

  const { data, isLoaded, hasErrors, } = useSelector((state) => state.widget);

  useEffect(() => {
    // dispatch async thunks are promises
    // https://redux-toolkit.js.org/api/createAsyncThunk#unwrapping-result-actions
    dispatch(createWidget({ title: 'my title', type: 'my type', photo: 'http://placekitten.com/200/300' }))
      .then(() => {
        dispatch(fetchAllWidgets());
      });
  }, [dispatch]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { ref: titleRef, ...titleRest } = register('title', { required: true });
  const { ref: typeRef, ...typeRest } = register('type', { required: true });
  const { ref: photoRef, ...photoRest } = register('photo', { required: true });

  const onSubmit = data => {
    if (Object.keys(errors).length) {
      alert('Error saving widget: ' + JSON.stringify(errors));
    } else {
      dispatch(savePhoto({ file: data.photo[0] })).then(action => {
        const photoUrl = action.payload;
        if (photoUrl) {
          dispatch(createWidget({ title: data.title, type: data.type, photo: photoUrl }))
            .then(() => {
              reset();
              dispatch(fetchAllWidgets());
            });
        }
      });
    }
  };

  return (
    <Layout {...props}>
      <nav className="d-flex flex-column align-items-center">
        <h1 className="my-3 text-center">My Project</h1>
        <section>
          {!isLoaded && 'Widgets loading…'}
          {hasErrors && 'Error Loading'}
          {isLoaded &&
            <div>
              <h4 className="my-3 text-center">Widgets are Loaded!</h4>
              <Form onSubmit={handleSubmit(onSubmit)} className="p-3 my-3 border border-primary">
                <FormGroup>
                  <Label for="title">Widget Title</Label>
                  <Input id="title" type="text" {...titleRest} innerRef={titleRef} invalid={errors.title} />
                </FormGroup>
                <FormGroup>
                  <Label for="type">Widget Type</Label>
                  <Input id="type" type="text" {...typeRest} innerRef={typeRef} invalid={errors.type} />
                </FormGroup>
                <FormGroup>
                  <Label for="photo">Widget Photo</Label>
                  <Input id="photo" type="file" accept="image/*" {...photoRest} innerRef={photoRef} invalid={errors.photo} />
                </FormGroup>
                <Button type="submit" color="primary">Save Widget</Button>
              </Form>
              <pre style={{width:"300px"}}>{JSON.stringify(data, null, 2)}</pre>
            </div>
          }
        </section>
      </nav>
    </Layout>
  );
}
