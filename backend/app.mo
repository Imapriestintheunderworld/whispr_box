import Time "mo:base/Time";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

actor {

  type SuggestionId = Nat;

  type Suggestion = {
    id: SuggestionId;
    content: Text;
    createdAt: Time.Time;
    likes: Nat;
    dislikes: Nat;
  };

  private stable var nextId : SuggestionId = 0;
  private stable var stableData : [(SuggestionId, Suggestion)] = [];

  private var suggestionMap = HashMap.fromIter<SuggestionId, Suggestion>(
    stableData.vals(),
    10,
    Nat.equal,
    Hash.hash
  );

  public func addSuggestion(content: Text) : async SuggestionId {
    let now = Time.now();
    let suggestion: Suggestion = {
      id = nextId;
      content = content;
      createdAt = now;
      likes = 0;
      dislikes = 0;
    };
    suggestionMap.put(nextId, suggestion);
    nextId += 1;
    return nextId - 1;
  };

  public query func getAllSuggestions() : async [Suggestion] {
    Iter.toArray(Iter.map(suggestionMap.vals(), func(s: Suggestion) : Suggestion { s }))
  };

  public func voteSuggestion(id: SuggestionId, isLike: Bool) : async Bool {
    switch (suggestionMap.get(id)) {
      case (null) { return false };
      case (?s) {
        let updated: Suggestion = {
          id = s.id;
          content = s.content;
          createdAt = s.createdAt;
          likes = if (isLike) s.likes + 1 else s.likes;
          dislikes = if (isLike) s.dislikes else s.dislikes + 1;
        };
        suggestionMap.put(id, updated);
        return true;
      }
    }
  };

  system func preupgrade() {
    stableData := Iter.toArray(suggestionMap.entries());
  };

  system func postupgrade() {
    suggestionMap := HashMap.fromIter<SuggestionId, Suggestion>(
      stableData.vals(),
      10,
      Nat.equal,
      Hash.hash
    );
  };
};
