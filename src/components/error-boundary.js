import React from 'react';

//https://reactjs.org/docs/error-boundaries.html
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <div className='mt-5'><h5>Message</h5>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Stack Trace</summary>
              {this.state.errorInfo.componentStack}
            </details>
          </div>
          <div className='my-5'><h3>Suggested Solution</h3>
            <HelpMessage error={this.state.error} />
          </div>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

function HelpMessage(props) {
  let retVal;

  const { error } = props;

  const message = error && error.toString();
  if (message) {
    if (/api key/i.test(message)) {
      retVal = apiKeyFix;
    } else {
      retVal = 'there are no suggested solutions right now.'
    }
  } else {
    retVal = 'there are no suggested solutions right now.'
  }

  return retVal;
}

const apiKeyFix = (
  <>
    <ol>
      <li>Go to Firebase, ensure you've setup a project. That link is <a href="https://console.firebase.google.com/" target="_blank">https://console.firebase.google.com/</a>.
        <ol>
          <li>Start by creating a web app. Skip the hosting option for now.
          <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Screenshot</summary>
              <img className="img-fluid" src="https://www.evernote.com/l/ABfsTDNFYXxPTYekNg_Zdg2ez05TVdEYP1oB/image.png" alt="Screenshot of Firebase web app creation" />
            </details>
          </li>
          <li>Next, go to <pre style={{ "display": "inline" }}>Authentication</pre> tab. Make sure <pre style={{ "display": "inline" }}>Email/Password is enabled</pre>.</li>
          <li>Next, go to <pre style={{ "display": "inline" }}>Firestore Database</pre> tab. Make sure <pre style={{ "display": "inline" }}>Start in test mode</pre> is selected.</li>
          <li>Next, go to <pre style={{ "display": "inline" }}>Storage</pre> tab. Make sure <pre style={{ "display": "inline" }}>Start in test mode</pre> is selected.</li>
        </ol>
      </li>
      <li>Make sure <pre style={{ "display": "inline" }}>env.local</pre> exists.
        <ol>
          <li>Do this by making a copy of <pre style={{ "display": "inline" }}>env.local.example</pre> and naming it <pre style={{ "display": "inline" }}>env.local</pre>.</li>
          <li>Go to <a href="https://console.firebase.google.com/" target="_blank">https://console.firebase.google.com/</a> and fill in <pre style={{ "display": "inline" }}>env.local</pre> with the config values from firebase. Click Project Overview → Project Settings → Your Apps (bottom of page).</li>
          <li><strong>Restart the app</strong>.</li>
        </ol>
      </li>
    </ol>
  </>
)
