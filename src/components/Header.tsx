import { Heart, Menu, User, LogOut, PlusCircle, Flame, Navigation, Mic, MicOff, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { brazilStates } from "@/data/locations";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { user, userRole, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Função de geolocalização
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada");
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`
          );
          
          const data = await response.json();
          const stateFromAPI = data.address?.state;
          
          if (stateFromAPI) {
            const matchedState = brazilStates.find(state => 
              state.name.toLowerCase().includes(stateFromAPI.toLowerCase()) ||
              stateFromAPI.toLowerCase().includes(state.name.toLowerCase())
            );
            
            if (matchedState) {
              toast.success(`📍 ${matchedState.name}`);
              navigate(`/acompanhantes/${matchedState.code.toLowerCase()}`);
            } else {
              toast.error("Estado não encontrado");
            }
          } else {
            toast.error("Localização indisponível");
          }
        } catch (error) {
          console.error("Erro ao buscar localização:", error);
          toast.error("Erro ao processar localização");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        setIsLocating(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Permissão negada");
        } else {
          toast.error("Erro ao obter localização");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Função de busca por voz
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Busca por voz não suportada");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("🎤 Fale agora...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      toast.success(`Buscando: ${transcript}`);
      navigate(`/?search=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        toast.error("Nenhuma fala detectada");
      } else if (event.error === 'not-allowed') {
        toast.error("Permissão de microfone negada");
      } else {
        toast.error("Erro ao reconhecer voz");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 py-1">
              <span className="flex-shrink-0 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="35" height="35" viewBox="0 0 384 383.999986" preserveAspectRatio="xMidYMid meet" version="1.0">
                  <defs>
                    <clipPath id="2114907379">
                      <path d="M 21.839844 10 L 362 10 L 362 383 L 21.839844 383 Z M 21.839844 10 " clipRule="nonzero" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#2114907379)">
                    <path fill="currentColor" d="M 334.0625 240.71875 C 309.8125 222.261719 321.648438 238.101562 323.558594 247.890625 C 325.320312 256.902344 322.457031 269.070312 311.382812 282.027344 C 298.726562 296.832031 316.386719 286.328125 316.386719 286.328125 C 316.386719 286.328125 322.285156 282.511719 332.140625 282.050781 C 331.96875 285.304688 331.609375 289.015625 330.910156 293.164062 C 329.5 301.300781 326.707031 311.261719 321.003906 321.226562 C 320.277344 322.421875 319.558594 323.8125 318.816406 324.914062 C 317.972656 326.199219 317.113281 327.503906 316.242188 328.839844 C 315.359375 330.027344 314.453125 331.242188 313.550781 332.464844 C 312.554688 333.667969 311.550781 334.894531 310.519531 336.128906 C 306.308594 340.976562 301.394531 345.628906 295.789062 349.832031 C 284.605469 358.195312 270.609375 364.765625 255.027344 367.25 C 239.457031 369.757812 222.488281 368.039062 206.261719 362.035156 C 198.144531 359.054688 190.1875 355.113281 182.492188 350.488281 C 174.804688 345.824219 167.484375 340.273438 160.359375 334.402344 C 155.765625 330.359375 151.230469 326.203125 146.859375 321.828125 C 152.589844 318.414062 157.8125 314.847656 162.59375 311.28125 C 173.867188 321.226562 181.921875 327.769531 184.046875 329.480469 C 188.628906 333.839844 194.589844 336.234375 200.917969 336.234375 C 207.253906 336.234375 213.226562 333.839844 217.804688 329.472656 C 227.5 321.652344 361.851562 212.023438 361.851562 140.554688 C 361.851562 123.132812 357.398438 107.402344 349.480469 94.308594 C 356.082031 74.984375 359.730469 44.261719 332.679688 17.15625 C 315.558594 0.015625 325.410156 20.867188 325.410156 20.867188 C 325.410156 20.867188 330.035156 41.507812 315.332031 63.476562 C 303.800781 57.996094 290.609375 54.96875 276.265625 54.96875 C 247.5 54.96875 220.769531 68.992188 204.699219 92.492188 L 201.367188 96.710938 L 199.160156 93.890625 C 183.273438 69.511719 156.496094 54.96875 127.425781 54.96875 C 112.464844 54.96875 98.757812 58.265625 86.878906 64.199219 C 71.59375 41.964844 76.308594 20.867188 76.308594 20.867188 C 76.308594 20.867188 86.160156 0.015625 69.042969 17.15625 C 40.988281 45.265625 45.945312 77.257812 52.980469 96.40625 C 45.835938 109.074219 41.832031 124.054688 41.832031 140.558594 C 41.832031 193.257812 110.476562 263.914062 152.574219 302.292969 C 147.429688 305.089844 141.9375 307.824219 136.113281 310.3125 C 134.355469 308.273438 132.628906 306.199219 130.871094 304.15625 C 127.449219 300.207031 124.648438 296.761719 120.8125 292.769531 C 113.578125 285.117188 105.953125 277.996094 97.097656 271.734375 C 88.203125 265.617188 78.253906 260.117188 66.238281 257.808594 C 60.257812 256.707031 53.664062 256.457031 46.902344 258.136719 C 40.183594 259.730469 33.351562 263.707031 28.578125 269.679688 C 26.210938 272.664062 24.4375 276.105469 23.242188 279.667969 C 22.117188 283.265625 21.664062 286.980469 21.75 290.597656 C 22.085938 297.75 24.699219 304.613281 28.207031 309.605469 C 31.746094 314.734375 35.375 318.476562 39.523438 322.015625 C 43.617188 325.460938 48.019531 328.398438 52.597656 330.859375 C 61.792969 335.71875 71.679688 338.5 81.285156 339.417969 C 99.027344 340.984375 114.980469 336.804688 128.4375 331.21875 C 134.9375 337.421875 141.886719 343.160156 148.917969 348.667969 C 157.019531 354.703125 165.335938 360.367188 174.125 365.105469 C 182.925781 369.816406 192.042969 373.78125 201.394531 376.6875 C 220.0625 382.566406 239.75 383.59375 257.386719 379.8125 C 275.082031 376.125 290.425781 367.800781 302.128906 357.691406 C 308.019531 352.65625 313.074219 347.207031 317.335938 341.621094 C 318.359375 340.199219 319.378906 338.796875 320.386719 337.40625 C 321.324219 335.941406 322.253906 334.492188 323.175781 333.0625 C 323.964844 331.675781 324.742188 330.304688 325.503906 328.964844 C 326.386719 327.429688 326.921875 326.042969 327.644531 324.621094 C 332.929688 313.234375 335.003906 302.539062 335.769531 293.667969 C 336.074219 289.355469 336.082031 285.476562 335.933594 282.089844 C 345.890625 282.953125 352.5 290.664062 354.214844 295.164062 C 356.027344 299.933594 360.089844 260.535156 334.0625 240.71875 Z M 105.398438 319.179688 C 98.285156 320.164062 90.953125 320.1875 83.8125 318.96875 C 76.660156 317.882812 69.6875 315.441406 63.375 311.640625 C 60.25 309.710938 57.273438 307.46875 54.585938 304.9375 C 51.980469 302.476562 49.300781 299.496094 47.71875 296.960938 C 44.53125 291.910156 44.894531 287.339844 47.179688 284.507812 C 49.359375 281.644531 54.925781 279.882812 62.070312 281.113281 C 69.152344 282.355469 76.929688 285.953125 84.25 290.683594 C 91.546875 295.496094 98.726562 301.441406 105.253906 307.800781 C 108.230469 310.527344 111.554688 314.269531 114.640625 317.410156 C 111.617188 318.132812 108.535156 318.742188 105.398438 319.179688 Z M 105.398438 319.179688 " fillOpacity="1" fillRule="nonzero" />
                  </g>
                  <g fill="currentColor" fillOpacity="1">
                    <g transform="translate(187.607805, 197.624984)">
                      <g>
                        <path d="M 8.015625 -3.046875 C 8.015625 -2.035156 7.648438 -1.25 6.921875 -0.6875 C 6.191406 -0.125 5.203125 0.15625 3.953125 0.15625 C 2.597656 0.15625 1.554688 -0.0195312 0.828125 -0.375 L 0.828125 -1.65625 C 1.296875 -1.457031 1.804688 -1.300781 2.359375 -1.1875 C 2.910156 -1.070312 3.457031 -1.015625 4 -1.015625 C 4.882812 -1.015625 5.550781 -1.179688 6 -1.515625 C 6.445312 -1.847656 6.671875 -2.316406 6.671875 -2.921875 C 6.671875 -3.316406 6.59375 -3.640625 6.4375 -3.890625 C 6.28125 -4.140625 6.015625 -4.367188 5.640625 -4.578125 C 5.265625 -4.796875 4.695312 -5.039062 3.9375 -5.3125 C 2.875 -5.695312 2.113281 -6.148438 1.65625 -6.671875 C 1.207031 -7.191406 0.984375 -7.867188 0.984375 -8.703125 C 0.984375 -9.585938 1.3125 -10.289062 1.96875 -10.8125 C 2.632812 -11.332031 3.507812 -11.59375 4.59375 -11.59375 C 5.726562 -11.59375 6.773438 -11.382812 7.734375 -10.96875 L 7.3125 -9.8125 C 6.375 -10.207031 5.457031 -10.40625 4.5625 -10.40625 C 3.863281 -10.40625 3.316406 -10.253906 2.921875 -9.953125 C 2.523438 -9.648438 2.328125 -9.226562 2.328125 -8.6875 C 2.328125 -8.289062 2.398438 -7.96875 2.546875 -7.71875 C 2.691406 -7.46875 2.9375 -7.234375 3.28125 -7.015625 C 3.625 -6.804688 4.15625 -6.578125 4.875 -6.328125 C 6.070312 -5.898438 6.894531 -5.441406 7.34375 -4.953125 C 7.789062 -4.460938 8.015625 -3.828125 8.015625 -3.046875 Z M 8.015625 -3.046875 " />
                      </g>
                    </g>
                  </g>
                </svg>
              </span>
              <div className="flex items-baseline">
                <span className="text-[1.30rem] font-medium text-primary" style={{ letterSpacing: '1px' }}>
                  SCORT
                </span>
                <span className="text-[0.80rem] font-normal text-foreground" style={{ letterSpacing: '2px' }}>
                  BRASIL
                </span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Navegar
              </Link>
              <Link to="/feed" className="text-sm font-medium hover:text-primary transition-colors">
                Feed
              </Link>
              <Link to="/favoritos" className="text-sm font-medium hover:text-primary transition-colors">
                Favoritos
              </Link>
              <Link to="/faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link to="/sobre" className="text-sm font-medium hover:text-primary transition-colors">
                Sobre
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/favoritos">
              <Button variant="ghost" size="icon" className="hidden md:flex relative" aria-label="Ver favoritos">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary"
                    aria-label={`${favorites.length} favoritos`}
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <>
                <NotificationCenter />
                
                <ThemeToggle />
                
                <Link to="/anuncios/novo" className="hidden md:block">
                <Button variant="default" className="bg-gradient-to-r from-primary to-primary hover:opacity-90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Anunciar Grátis
                </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Meu Painel
                      </Link>
                    </DropdownMenuItem>
                    {userRole === 'model' && (
                      <DropdownMenuItem asChild>
                        <Link to="/planos" className="cursor-pointer">
                          <Star className="mr-2 h-4 w-4" />
                          Planos Premium
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/dashboard" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Painel Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                
                <Link to="/auth" className="hidden md:block">
                  <Button variant="outline">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth" className="hidden md:block">
                  <Button className="bg-gradient-to-r from-primary to-primary hover:opacity-90">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Anunciar Grátis
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Navegar
                  </Link>
                  <Link 
                    to="/feed" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Feed
                  </Link>
                  <Link 
                    to="/favoritos" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2 flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Favoritos
                    {favorites.length > 0 && (
                      <Badge className="bg-primary">
                        {favorites.length}
                      </Badge>
                    )}
                  </Link>
                  <Link 
                    to="/faq" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link 
                    to="/sobre" 
                    className="text-lg font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Sobre
                  </Link>
                  {user ? (
                    <>
                      <Link 
                        to="/anuncios/novo" 
                        className="text-lg font-medium hover:text-primary transition-colors py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Anunciar Grátis
                      </Link>
                      <Link 
                        to="/dashboard" 
                        className="text-lg font-medium hover:text-primary transition-colors py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Meu Painel
                      </Link>
                      <Button 
                        variant="destructive"
                        className="w-full mt-4"
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                      >
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/auth" 
                        onClick={() => setIsOpen(false)}
                        className="mt-4"
                      >
                        <Button variant="outline" className="w-full">
                          Entrar
                        </Button>
                      </Link>
                      <Link 
                        to="/auth" 
                        onClick={() => setIsOpen(false)}
                        className="mt-2"
                      >
                        <Button className="w-full bg-gradient-to-r from-primary to-primary hover:opacity-90">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Anunciar Grátis
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="pb-4 flex gap-2">
          <div className="flex-1">
            <SearchAutocomplete />
          </div>
          
          {/* Botão de Busca por Voz */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceSearch}
            disabled={isListening}
            title="Buscar por voz"
            className="shrink-0"
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-destructive animate-pulse" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Botão de Geolocalização */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleGeolocation}
            disabled={isLocating}
            title="Usar minha localização"
            className="shrink-0"
          >
            {isLocating ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
