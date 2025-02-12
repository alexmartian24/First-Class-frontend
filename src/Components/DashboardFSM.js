import React, {useState} from React;

transaction = {
    Submitted: ["Rejected", "Referee Review", "Withdrawn"],
    RefereeReview: ["Rejected", "Referee Review", "Author Revisions", "Submitted"],
    AuthorRevisions: ["Editor Review"],
    EditorReview: ["Copy Edit"],
    CopyEdit: ["Author Review"],
    AuthorReview: ["Formatting"],
    Formatting: ["Published"],
    Withdrawn: [],
    Rejected: [],
  };