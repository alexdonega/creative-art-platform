                    {/* Aba Visual */}
                    <TabsContent value="visual" className="space-y-6">
                      <div className="space-y-6">
                        {/* Upload da Logo da Empresa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium flex items-center gap-2">
                                  <Upload className="h-4 w-4" />
                                  Logo da Empresa
                                </FormLabel>
                                <FormControl>
                                  <div className="space-y-4">
                                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                      {field.value ? (
                                        <img
                                          src={field.value}
                                          alt="Logo Preview"
                                          className="w-full h-full object-contain"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                          onLoad={(e) => {
                                            // Extract colors when logo loads
                                            extractColorsFromLogo(e.currentTarget);
                                          }}
                                        />
                                      ) : (
                                        <div className="text-center text-gray-400">
                                          <Upload className="h-8 w-8 mx-auto mb-2" />
                                          <span className="text-xs">Upload da Logo</span>
                                        </div>
                                      )}
                                    </div>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const formData = new FormData();
                                            formData.append('logo', file);
                                            
                                            const response = await fetch('/api/upload-logo-temp', {
                                              method: 'POST',
                                              body: formData
                                            });
                                            
                                            if (response.ok) {
                                              const result = await response.json();
                                              field.onChange(result.logoUrl);
                                              
                                              // Auto-extrair cores da logo
                                              const img = new Image();
                                              img.crossOrigin = 'anonymous';
                                              img.onload = () => extractColorsFromLogo(img);
                                              img.src = result.logoUrl;
                                            }
                                          } catch (error) {
                                            console.error('Error uploading logo:', error);
                                          }
                                        }
                                      }}
                                    />
                                    <div className="text-sm text-gray-500">
                                      Ou forneça uma URL:
                                    </div>
                                    <Input
                                      value={field.value || ''}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      placeholder="https://exemplo.com/logo.png"
                                      className="text-sm"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="logo_formato"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Formato da Logo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 text-left">
                                      <SelectValue placeholder="Selecione o formato da sua logo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="quadrada">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-blue-500 rounded"></div>
                                        <span>Quadrada</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="retangular">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-4 bg-green-500 rounded"></div>
                                        <span>Retangular (horizontal)</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="vertical">
                                      <div className="flex items-center gap-3">
                                        <div className="w-4 h-8 bg-purple-500 rounded"></div>
                                        <span>Vertical</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                                <p className="text-xs text-gray-500 mt-1">
                                  Informe o formato para otimizar a geração de artes
                                </p>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          As cores serão extraídas automaticamente da nova logo.
                        </p>