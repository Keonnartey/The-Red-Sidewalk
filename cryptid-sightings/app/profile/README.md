
      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-8">
          {/* Achievements Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
              <h2 className="text-white text-2xl font-bold mb-4">THE SOCIALITE</h2>
              <div className="flex justify-center mb-4">
                <Image
                  src="/badges/socialite.png"
                  alt="Scroll"
                  width={150}
                  height={150}
                  className="w-32 h-32"
                />
              </div>
              <p className="text-white text-center">Congrats, you left a comment on someone's post</p>
            </div>

            <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
              <h2 className="text-white text-2xl font-bold mb-4">THE HALLUCINATOR</h2>
              <div className="flex justify-center mb-4">
                <Image
                  src="/badges/hallucinator.png"
                  alt="Mushroom"
                  width={150}
                  height={150}
                  className="w-32 h-32"
                />
              </div>
              <p className="text-white text-center">NOT congrats. You had 3 1-star rated sightings.</p>
            </div>
          </div>

          {/* Badges to Earn */}
          <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
            <h2 className="text-white text-2xl font-bold mb-6">SOME OTHER BADGES TO EARN:</h2>

            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
                  <Image
                    src="/badges/camera_ready.png"
                    alt="Dragon"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <p className="text-white text-center text-sm">CAMERA READY</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
                  <Image
                    src="/badges/dragon_rider.png"
                    alt="Dragon"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <p className="text-white text-center text-sm">DRAGON RIDER</p>
              </div>

              <div className="flex flex-col items-center relative">
                <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
                  <Image
                    src="/badges/elite_hunter.png"
                    alt="Bow"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <p className="text-white text-center text-sm">THE HUNTER</p>

                {/* <div className="absolute right-0 top-0 bg-[#d9d9d9] rounded-lg p-2 text-xs w-48 transform translate-x-1/2 -translate-y-1/2">
                  Find all 5 creatures to earn this badge.
                  <div className="absolute w-3 h-3 bg-[#d9d9d9] transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
