import React, { useState, useEffect, useContext, useReducer, useCallback, useMemo } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "../static/site.css";
import { Header } from "../src/Header";
import { Menu } from "../src/Menu";
import SpeakerData from "./SpeakerData";
import SpeakerDetail from "./SpeakerDetail";
import { ConfigContext } from "./App";
import speakersReducer from "./speakersReducer";
import useAxiosFetch from "./useAxiosFetch";
import axios from "axios";

const Speakers = ({}) => {
  const [speakingSaturday, setSpeakingSaturday] = useState(true);
  const [speakingSunday, setSpeakingSunday] = useState(true);
  const { data,
          isLoading,
          hasErrored,
          errorMessage,
          updateDataRecord} = useAxiosFetch("http://localhost:4000/speakers", []);
  //const [speakerList, setSpeakerList] = useState([]);
  // const [speakerList, dispatch] = useReducer( speakersReducer, []);
  // const [isLoading, setIsLoading] = useState(true);

  const context = useContext(ConfigContext);

  const handleChangeSaturday = () => {
    setSpeakingSaturday(!speakingSaturday);
  };

  const newSpeakerList = useMemo( () => 
      data
        .filter(
          ({ sat, sun }) => (speakingSaturday && sat) || (speakingSunday && sun)
        )
        .sort(function(a, b) {
          if (a.firstName < b.firstName) {
            return -1;
          }
          if (a.firstName > b.firstName) {
            return 1;
          }
          return 0;
        })
  , [speakingSaturday, speakingSunday, data]);

  const speakerListFiltered = isLoading ? [] : newSpeakerList;

  const handleChangeSunday = () => {
    setSpeakingSunday(!speakingSunday);
  };

  const heartFavoriteHandler = useCallback( (e, speakerRecord) => {
    e.preventDefault();
    const toggledRecord = {...speakerRecord, favorite: !speakerRecord.favorite};
    axios.put(`http://localhost:4000/speakers/${speakerRecord.id}`, toggledRecord)
      .then( function(response) {
        updateDataRecord(toggledRecord);
      })
      .catch( function(error) {
        console.log(error);
      });
    
    //console.log("changing session favorte to " + favoriteValue);
  }, []);

  if (hasErrored) {
    return (<div>
      {errorMessage}&nbsp;"Make sure you have launched 'npm run json-server'"
    </div>);
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Header />
      <Menu />
      <div className="container">
        { context.showSpeakerSpeakingDays === false ? null : (
          <div className="btn-toolbar  margintopbottom5 checkbox-bigger">
            <div className="hide">
              <div className="form-check-inline">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleChangeSaturday}
                    checked={speakingSaturday}
                  />
                  Saturday Speakers
                </label>
              </div>
              <div className="form-check-inline">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleChangeSunday}
                    checked={speakingSunday}
                  />
                  Sunday Speakers
                </label>
              </div>
            </div>
          </div>
        )}
        <div className="row">
          <div className="card-deck">
            {speakerListFiltered.map(
              ({ id, firstName, lastName, sat, sun, bio, favorite }) => {
                return (
                  <SpeakerDetail
                    key={id}
                    id={id}
                    favorite={favorite}
                    onHeartFavoriteHandler={heartFavoriteHandler}
                    firstName={firstName}
                    lastName={lastName}
                    bio={bio}
                    sat={sat}
                    sun={sun}
                  />
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speakers;
