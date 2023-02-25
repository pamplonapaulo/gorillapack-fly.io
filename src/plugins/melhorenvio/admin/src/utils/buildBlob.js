'use strict';

const buildBlob = (obj, status = 200, message = 'Success') =>
  new Response(
    new Blob(
      [JSON.stringify(
        obj,
        null,
        2
      )],
      {type : 'application/json'}
    ),
    { status , message }
  );

export default buildBlob;
