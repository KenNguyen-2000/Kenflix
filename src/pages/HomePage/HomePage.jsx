import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  Description,
  MovieListContainer,
  Title,
  Trailer,
  TrailerAction,
  TrailerContent,
  TrailerOverlay,
  Wrapper
} from './HomePage.style';
import { API_KEY, base_img_url, BASE_URL, fetchData } from '../../api/request';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faPlay } from '@fortawesome/free-solid-svg-icons';
import MovieSection from '../../components/MovieSection/MovieSection';
import { Button } from '../../components';
import MovieDetail from '../../components/MovieDetail/MovieDetail';
import YouTube from 'react-youtube';
import { useDispatch, useSelector } from 'react-redux';
import { addVideos, setMovie, setTrailer } from '../../redux/index';
import Loader from './Loader/Loader';

const HomePage = () => {
  const [trailerVideo, setTrailerVideo] = useState();
  const [open, setOpen] = useState(false);
  const [play, setPlay] = useState(false);
  const [player, setPlayer] = useState();
  const [loading, setLoading] = useState(true);
  const [buttonClick, setClick] = useState(true);
  const [scaleHeight, setScaleHeight] = useState(0);

  const { fetchTopRated, fetchPopular, fetchUpcoming } = fetchData;
  const trailer = useSelector((state) => state.trailer);
  const dispatch = useDispatch();
  const wrapperRef = useRef();

  const [opts] = useState({
    playerVars: {
      controls: 0,
      autoplay: 0,
      end: 30,
      modestbranding: 1
    }
  });

  const playTrailer = () => {
    setPlay(true);
    setScaleHeight(document.getElementById('trailer-description')?.clientHeight);
    console.log(wrapperRef.current.offsetWidth);
    if (buttonClick && player) {
      player.playVideo();
      console.log(document.getElementById('trailer-description').clientHeight);
      document.getElementById('trailer-title').classList.add('scaleDownTitle');
      document.getElementById('trailer-description').classList.add('scaleDownDescription');
      setClick((prev) => !prev);
    } else {
      player.pauseVideo();
      setClick((prev) => !prev);
    }
  };

  const renderTrailer = () => {
    const trailer = trailerVideo.results[0];
    if (trailer) {
      return (
        <YouTube
          videoId={trailer.key}
          id={'trailer-ytb'}
          title={'Aloasdasd'}
          opts={opts}
          onReady={(event) => setPlayer(event.target)}
          onEnd={(event) => {
            event.target.seekTo(0);
            event.target.pauseVideo();
            setClick(true);
            setPlay(false);
            document.getElementById('trailer-title').classList.remove('scaleDownTitle');
            document.getElementById('trailer-description').classList.remove('scaleDownDescription');
          }}
        />
      );
    }
  };

  const handleTrailerDetail = async () => {
    const detailRes = await axios.get(`${BASE_URL}/movie/${trailer.id}?api_key=${API_KEY}`);
    dispatch(setMovie(detailRes.data));
    const videoRes = await axios.get(`${BASE_URL}/movie/${detailRes.data.id}/videos`, {
      params: {
        api_key: API_KEY,
        append_to_response: 'videos'
      }
    });
    dispatch(addVideos(videoRes.data.results));
    setOpen(true);
  };

  useEffect(() => {
    const randomTrailer = Math.floor((Math.random() + 100) * 100);

    const fetchTrailer = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/movie/${randomTrailer}`, {
          params: {
            api_key: API_KEY
          }
        });
        dispatch(setTrailer(res.data));
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/movie/${randomTrailer}/videos`, {
          params: {
            api_key: API_KEY,
            append_to_response: 'videos'
          }
        });
        await setTrailerVideo(res.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTrailer();
    fetchVideos();
  }, []);

  return (
    <>
      <Wrapper scaleHeight={scaleHeight} ref={wrapperRef}>
        {open && <MovieDetail open={open} setOpen={setOpen} />}

        {loading ? (
          <Loader />
        ) : (
          <>
            <Trailer play={play}>
              <img src={`${base_img_url}${trailer?.backdrop_path}`} />
              <div className="img-overlay"></div>
              {trailerVideo && renderTrailer()}
              <TrailerOverlay />
              <TrailerContent>
                <Title id="trailer-title">{trailer?.title}</Title>
                <Description id="trailer-description">{trailer?.overview}</Description>
                <TrailerAction>
                  <Button onClick={playTrailer}>
                    <FontAwesomeIcon icon={faPlay} /> Play
                  </Button>
                  <Button onClick={handleTrailerDetail}>
                    <FontAwesomeIcon icon={faCircleInfo} />
                    <span>More Info</span>
                  </Button>
                </TrailerAction>
              </TrailerContent>
            </Trailer>
            <MovieListContainer>
              <MovieSection title={'Trending Now'} method={fetchPopular} setOpen={setOpen} />
              <MovieSection
                title={'Exciting TV Action & Adventure'}
                method={fetchTopRated}
                setOpen={setOpen}
              />
              <MovieSection title={'Upcoming'} method={fetchUpcoming} setOpen={setOpen} />
            </MovieListContainer>
          </>
        )}
      </Wrapper>
    </>
  );
};

export default HomePage;
