import { fireDb } from "@/plugins/firebase.js";

const getDefaultState = () => {
  return {
    notes: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: scheduler/resetState");
    Object.assign(state, getDefaultState());
  },

  setNotes(state, notes) {
    state.notes = notes;
  },
  addNote(state, note) {
    state.notes.push(note);
  },
  editNote(state, note) {
    const { title, body, type, id } = note
    const i = state.notes.findIndex(n => n.id === id)
    state.notes[i].title = title 
    state.notes[i].body = body 
    state.notes[i].type = type 
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initNotes(vuexContext, dateWithFormat) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    console.log("initNotes: companies/", companyId, "/notes", dateWithFormat);

    const ref = fireDb
      .collection("companies")
      .doc(companyId)
      .collection("notes");

    // each note has an attribute noteDate used or easy querying of notes for a particular day.
    const query = ref
      .where("noteDate", "==", dateWithFormat)
      .orderBy("created", "asc");

    const notes = [];
    let snapshot;
    try {
      snapshot = await query.get();
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          let note = doc.data();
          note.id = doc.id;
          notes.push(note);
        }
      }
      console.log("READ ", notes.length, " notes documents.");

      vuexContext.commit("setNotes", notes);
    } catch (error) {
      console.error("Unable to pull notes from the data store", error);
      vuexContext.commit("setNotes", []);
    }
  },

  setNotes(vuexContext, notes) {
    vuexContext.commit("setNotes", notes);
  },

  addNote(vuexContext, note) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("notes")
      .add(note)
      .then(function(docRef) {
        note.id = docRef.id;
        vuexContext.commit("addNote", note);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editNote(vuexContext, note) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const { title, body, type, id } = note

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("notes")
      .doc(id)
      .update({
        title: title, 
        body: body, 
        type: type
      })
      .then(()=>{
        vuexContext.commit("editNote", note);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  markNoteAsSeen(vuexContext, value) {
    const { noteId, loggedInUserId } = value;
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("notes")
      .doc(noteId)
      .get()
      .then(function(doc) {
        const note = doc.data();

        let docRef = fireDb
          .collection("companies")
          .doc(companyId)
          .collection("notes")
          .doc(doc.id);

        note.seenByUsers.push(loggedInUserId);

        // update seen array on firebase for the note
        docRef.update({
          seenByUsers: note.seenByUsers
        });
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      });
  }
};

export const getters = {
  getAllNotes: (state, getters, rootState) => {
    const loggedInUserId = rootState.users.loggedInUserId;

    return state.notes.filter(n => !n.seenByUsers.includes(loggedInUserId));
  }
};
