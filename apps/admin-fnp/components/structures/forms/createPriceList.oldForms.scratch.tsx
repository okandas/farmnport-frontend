        <h4 className="mt-10 mb-4 text-xl font-semibold tracking-tight scroll-m-20">
          Select Pricing forms for price list
        </h4>

        {/*Form Type Selectors*/}
        <div className="grid grid-cols-4 gap-2">
          <div className="border rounded-md">
            <FormField
              control={form.control}
              name="beef.hasPrice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0">
                  <FormLabel>Beef Pricing Form</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => {
                        return field.onChange(!field.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="beef.hasCollectedPrice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0">
                  <FormLabel>Add Collection Price</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => {
                        return field.onChange(!field.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="lamb.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Lamb Pricing Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mutton.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Mutton Pricing Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goat.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Goat Pricing Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border rounded-md">
            <FormField
              control={form.control}
              name="chicken.hasPrice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0">
                  <FormLabel>Chicken Pricing Form</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => {
                        return field.onChange(!field.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chicken.hasCollectedPrice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0">
                  <FormLabel>Add Collection Price</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => {
                        return field.onChange(!field.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="pork.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Pork Pricing Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="catering.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Catering Pricing Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/*End Form Type Selectors*/}

        {showBeef ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Beef Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Beef Start */}
              <h3 className="mt-3">Beef Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
                <FormField
                  control={form.control}
                  name="beef.super.pricing.delivered"
                  rules={{ required: "Super Pricing Required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.commercial.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commercial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Commercial Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.economy.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Economy</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Economy Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.manufacturing.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Manufacturing Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.condemned.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condemned</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Condemned Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showBeefCollectionPrice ? (
                <>
                  <h3 className="mt-2">Beef Prices Collected</h3>
                  <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
                    <FormField
                      control={form.control}
                      name="beef.super.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Super</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Super Beef"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="beef.choice.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choice</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Choice Beef"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="beef.commercial.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commercial</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Commercial Beef"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="beef.economy.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Economy</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Economy Beef"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="beef.manufacturing.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manufacturing</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Manufacturing Beef"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="beef.condemned.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condemned</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Condemned Beef"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : null}
              {/* Beef End */}
            </CardContent>
          </Card>
        ) : null}

        {showLamb ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Lamb Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lamb Start */}
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="lamb.super_premium.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super/Super Premium</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super/Super Premium Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.standard.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.inferior.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Lamb End */}
            </CardContent>
          </Card>
        ) : null}

        {showMutton ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Mutton Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mutton Start */}
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="mutton.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super "
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.standard.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.ordinary.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordinary</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Oridnary"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.inferior.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Mutton End */}
            </CardContent>
          </Card>
        ) : null}

        {showGoat ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Goat Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Goat Start */}
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="goat.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goat.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goat.standard.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goat.inferior.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Goat End */}
            </CardContent>
          </Card>
        ) : null}

        {showChicken ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Chicken Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chicken Start */}

              <h3>Chicken Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="chicken.a_grade_under_1_55.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Below 1.55 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Below 1.55kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chicken.a_grade_1_55_1_75.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1.55 to 1.75 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Between 1.55 and 1.75 Kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chicken.a_grade_over_1_75.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Over 1.75 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price For Over 1.75Kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chicken.off_layers.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Off Layers</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price OffLayers Chicken"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chicken.condemned.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condemned</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Condemned Chicken"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {showChickenCollectionPrice ? (
                <>
                  <h3 className="mt-3">Chicken Prices Collected</h3>
                  <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                    <FormField
                      control={form.control}
                      name="chicken.a_grade_under_1_55.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Below 1.55 Kgs</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Below 1.55kgs"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chicken.a_grade_1_55_1_75.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1.55 to 1.75 Kgs</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Between 1.55 and 1.75 Kgs"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chicken.a_grade_over_1_75.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Over 1.75 Kgs</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price For Over 1.75Kgs"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chicken.off_layers.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Off Layers</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price OffLayers Chicken"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="chicken.condemned.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condemned</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Condemned Chicken"
                              {...field}
                              type="number"
                              min="0"
                              step="any"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : null}
              {/* Chicken End */}
            </CardContent>
          </Card>
        ) : null}

        {showPork ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Pork Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pork Start */}
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="pork.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pork.manufacturing.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Manufacturing"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pork.head.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pork Head</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Pork Head"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Pork End */}
            </CardContent>
          </Card>
        ) : null}

        {showCatering ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Catering Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Catering Start */}
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="catering.chicken.order.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chicken Bird</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Chicken Bird"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Catering End */}
            </CardContent>
          </Card>
        ) : null}
