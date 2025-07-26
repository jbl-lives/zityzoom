'use client'

import { useEffect, useState } from 'react'
import PlaceList from '@/components/PlaceList'
import Header from '@/components/Header'
import PlaceIcons from '@/components/PlaceIcons'
import MapPanel from '@/components/MapPanel'
import CityInfoPanel from '@/components/CityInfoPanel'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchResult } from '@/hooks/use-places-search'
import { useLocation } from '@/hooks/use-location'
import { usePlacesSearch } from '@/hooks/use-places-search'

export default function Home() {
  const {
    currentLocation,
    isUsingUserLocation,
    setIsUsingUserLocation,
    searchError: locationSearchError,
    handleToggleLocationPreference,
    userCountry,
  } = useLocation()

  const {
    placeList,
    selectedPlace,
    isLoading,
    searchError: placesSearchError,
    currentSessionToken,
    activeCategory,
    currentSearchQuery,
    searchPlacesByQuery,
    handlePlaceSelection,
    handleCategorySelect: handleCategorySelectHook,
    setActiveCategory,
    searchCenterLocation,
  } = usePlacesSearch()

  const [isCityInfoPanelOpen, setIsCityInfoPanelOpen] = useState(false)
  const [cityForInfo, setCityForInfo] = useState<string | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(true) // Default to mobile for SSR

  const displayError = locationSearchError || placesSearchError

  useEffect(() => {
    if (currentLocation && !currentSearchQuery && !activeCategory) {
      searchPlacesByQuery('Restaurants', undefined, currentLocation.lat, currentLocation.lng)
      setActiveCategory('Restaurants')
    }
  }, [currentLocation, currentSearchQuery, activeCategory, searchPlacesByQuery, setActiveCategory])

  useEffect(() => {
    console.log('useEffect: cityForInfo =', cityForInfo, 'userCountry =', userCountry)
    setIsCityInfoPanelOpen(!!cityForInfo)
  }, [cityForInfo, userCountry])

  // Handle client-side window width detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 560)
    }
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSearchInitiated = () => {
    setActiveCategory(null)
    handlePlaceSelection(null)
  }

  const handleCategorySelectWrapper = async (keyword: string) => {
    await handleCategorySelectHook(keyword, currentLocation)
  }

  const handleCityClick = (cityName: string) => {
    console.log('handleCityClick: cityName =', cityName, 'userCountry =', userCountry)
    setCityForInfo(cityName)
  }

  const handleCloseCityInfo = () => {
    setIsCityInfoPanelOpen(false)
    setCityForInfo(null)
  }

  const handleToggleMap = () => {
    setIsMapExpanded(!isMapExpanded)
  }

  const handlePlaceSelectionWrapper = (place: SearchResult | null) => {
    handlePlaceSelection(place)
    if (place) setIsMapExpanded(true)
  }

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.3, ease: 'easeIn' } },
  }

  const mobilePanelVariants = {
    expanded: { height: '83vh', transition: { duration: 0.3, ease: 'easeOut' } },
    collapsed: { height: '10vh', transition: { duration: 0.3, ease: 'easeOut' } },
  }

  return (
    <div className="h-screen w-full">
      <Header
        userInput={searchPlacesByQuery}
        currentLocation={currentLocation}
        onCategorySelect={handleCategorySelectWrapper}
        onToggleLocationPreference={handleToggleLocationPreference}
        isUsingUserLocation={isUsingUserLocation}
        onCityClick={handleCityClick}
        onSearchInitiated={handleSearchInitiated}
      />
      <div className={`xl:px-6 xl:py-0 flex justify-center items-center ${isMobile ? 'px-2 py-0' : ''}`}>
        <div className="flex w-full bg-[url('/images/bg-pic5.jpg')] bg-rose-200 bg-cover bg-center xl:rounded-4xl xl:h-[85vh] relative md:rounded-4xl md:h-[90vh] h-[93vh] rounded-3xl overflow-hidden shadow-lg">
          <AnimatePresence mode="wait">
            {isCityInfoPanelOpen && cityForInfo ? (
              <motion.div
                key="cityInfoPanel"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 flex items-center justify-center md:p-4 p-1 rounded-4xl z-30"
              >
                <CityInfoPanel
                  cityName={cityForInfo}
                  userCountry={userCountry}
                  onClose={handleCloseCityInfo}
                />
              </motion.div>
            ) : (
              <motion.div
                key="mainContent"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex w-full h-full justify-center items-center"
              >
                <div className={`flex flex-col md:flex-col xl:flex-row w-full h-full gap-4 ${isMobile ? 'p-2' : 'md:p-4 p-1'} items-stretch`}>
                  {/* MapPanel: Collapsible on mobile (350px-560px) */}
                  <motion.div
                    className="card w-full xl:w-[55%] xl:order-2 order-1 xl:h-full md:rounded-3xl rounded-xs overflow-hidden"
                    variants={mobilePanelVariants}
                    animate={isMobile ? (isMapExpanded ? 'expanded' : 'collapsed') : 'expanded'}
                  >
                    <div className="relative h-full">
                      {!isMapExpanded && isMobile ? (
                        <div
                          className="h-full flex items-center justify-center bg-gray-900 rounded-xs cursor-pointer"
                          onClick={handleToggleMap}
                        >
                          <span className="text-white text-sm font-medium flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            Show Map
                          </span>
                        </div>
                      ) : (
                        <>
                          <MapPanel
                            mapCenter={searchCenterLocation || currentLocation}
                            userCurrentGeolocation={currentLocation}
                            placeList={placeList}
                            selectedPlaceId={selectedPlace?.place_id}
                          />
                          {isMobile && (
                            <button
                              className="absolute top-2 right-2 p-2 bg-gray-900 rounded-full text-white"
                              onClick={handleToggleMap}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={16}
                                height={16}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* PlaceList: Collapsible on mobile (350px-560px) */}
                  <motion.div
                    className="card w-full xl:w-[45%] xl:order-1 order-2 xl:h-full md:rounded-3xl rounded-xs overflow-hidden bg-white md:p-4 p-1"
                    variants={mobilePanelVariants}
                    animate={isMobile ? (isMapExpanded ? 'collapsed' : 'expanded') : 'expanded'}
                  >
                    <div className="relative h-full">
                      {isMapExpanded && isMobile ? (
                        <div
                          className="h-full flex items-center justify-center bg-white rounded-xs cursor-pointer"
                          onClick={handleToggleMap}
                        >
                          <span className="text-gray-700 text-sm font-medium flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 7h18M3 12h18M3 17h18" />
                            </svg>
                            Show List
                          </span>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-[20px] font-bold text-gray-700 mb-2 pt-4 px-4 sticky top-0 z-10 bg-white">
                            Search Results
                          </h2>
                          <div className="overflow-y-scroll h-[calc(100%-60px)] px-1 scrollbar-w-2 scrollbar-track-gray-200 scrollbar-thumb-rose-500 rounded-lg">
                            {displayError && !isLoading && (
                              <p className="text-red-500 text-center p-4">{displayError}</p>
                            )}
                            <PlaceList
                              placeList={placeList}
                              onSelectPlace={handlePlaceSelectionWrapper}
                              isLoading={isLoading}
                              sessionToken={currentSessionToken}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* PlaceIcons: Fixed height, hidden on mobile */}
                  {!isMobile && (
                    <div className="w-full xl:w-[5%] xl:order-0 order-3 h-[10vh] xl:h-full md:w-auto md:h-[10vh] md:flex md:justify-center md:overflow-visible overflow-hidden rounded-t-0">
                      <PlaceIcons
                        onSelectCategory={handleCategorySelectWrapper}
                        selectedCategory={activeCategory}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}