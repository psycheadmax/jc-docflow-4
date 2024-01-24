function jcBlockquote(contentBlock) {
  const type = contentBlock.getType();
  if (type === 'blockquote') {
    return 'jcBlockquote';
  }
}

export { jcBlockquote }