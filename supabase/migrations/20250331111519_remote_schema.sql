drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create policy "User Can CRUD his own profile"
on "public"."profiles"
as permissive
for all
to authenticated
using ((id = ( SELECT auth.uid() AS uid)));


create policy "Users can manage own shopping items"
on "public"."shopping_items"
as permissive
for all
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can manage there own tasks"
on "public"."tasks"
as permissive
for all
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



