let options = {
  blockRenderers: {
    code: (block) => {
      return (
        "<pre><code class='language-javascript'>" +
        block.getText() +
        "</pre></code>"
      );
    },
  },
};

export default options;
