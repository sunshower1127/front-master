import { deLocalizeUrl } from '$lib/shared/paraglide/runtime';

export const reroute = (request: Request) => deLocalizeUrl(request.url).pathname;
